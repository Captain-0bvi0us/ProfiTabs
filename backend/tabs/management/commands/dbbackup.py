import json
import sys
from datetime import datetime
from django.core.management.base import BaseCommand
from django.core import serializers
from django.contrib.auth.models import User
from accounts.models import Profile
from tabs.models import Tab, TabShare


class Command(BaseCommand):
    help = 'Export or import full database backup as JSON'

    def add_arguments(self, parser):
        parser.add_argument(
            'action',
            choices=['export', 'import'],
            help='"export" saves to file, "import" loads from file',
        )
        parser.add_argument(
            '--file',
            default=None,
            help='File path (default: backup_YYYY-MM-DD.json for export)',
        )

    def handle(self, *args, **options):
        action = options['action']
        if action == 'export':
            self._export(options)
        else:
            self._import(options)

    def _export(self, options):
        filepath = options['file'] or f'backup_{datetime.now():%Y-%m-%d}.json'

        objects = []
        objects.extend(User.objects.all())
        objects.extend(Profile.objects.all())
        objects.extend(Tab.objects.all())
        objects.extend(TabShare.objects.all())

        data = serializers.serialize('json', objects, indent=2)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(data)

        counts = {
            'users': User.objects.count(),
            'profiles': Profile.objects.count(),
            'tabs': Tab.objects.count(),
            'shares': TabShare.objects.count(),
        }
        self.stdout.write(self.style.SUCCESS(
            f'Exported to {filepath}: {counts}'
        ))

    def _import(self, options):
        filepath = options['file']
        if not filepath:
            self.stderr.write(self.style.ERROR('Specify --file for import'))
            sys.exit(1)

        with open(filepath, 'r', encoding='utf-8') as f:
            data = f.read()

        objects = serializers.deserialize('json', data)
        count = 0
        for obj in objects:
            obj.save()
            count += 1

        self.stdout.write(self.style.SUCCESS(
            f'Imported {count} objects from {filepath}'
        ))
