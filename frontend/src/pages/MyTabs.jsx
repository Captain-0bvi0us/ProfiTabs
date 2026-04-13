import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getAllTabs, deleteTab, importTab, parseImportedJSON } from '../hooks/useOfflineTabs';

const INSTR_LABEL = {
  guitar: 'Гитара',
  electric: 'Электрогитара',
  bass: 'Бас',
  drums: 'Барабаны',
};

export default function MyTabs() {
  const [tabs, setTabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importMsg, setImportMsg] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const fileInputRef = useRef(null);

  const loadTabs = async () => {
    const items = await getAllTabs();
    setTabs(items);
    setLoading(false);
  };

  useEffect(() => { loadTabs(); }, []);

  const requestDelete = (tab) => {
    setPendingDelete({ id: tab.id, title: tab.title || 'без названия' });
  };

  const cancelDelete = () => setPendingDelete(null);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const { id } = pendingDelete;
    setPendingDelete(null);
    await deleteTab(id);
    setTabs((prev) => prev.filter((t) => t.id !== id));
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = parseImportedJSON(text);
      const saved = await importTab(parsed);
      setImportMsg(`Импортировано: ${saved.title}`);
      await loadTabs();
      setTimeout(() => setImportMsg(''), 3000);
    } catch (err) {
      setImportMsg(`Ошибка: ${err.message}`);
      setTimeout(() => setImportMsg(''), 4000);
    }

    e.target.value = '';
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-dim)' }}>Загрузка...</div>;
  }

  return (
    <div className="my-tabs-page">
      <div className="page-header">
        <h2>Мои табы</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
            📥 Импорт
          </button>
          <Link to="/editor" className="btn btn-primary">+ Новый</Link>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleImport}
          style={{ display: 'none' }}
        />
      </div>

      {importMsg && (
        <div className={`import-msg card ${importMsg.startsWith('Ошибка') ? 'import-error' : 'import-success'}`}>
          {importMsg}
        </div>
      )}

      {tabs.length === 0 ? (
        <div className="empty-state card">
          <p>У вас пока нет табулатур</p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
            <Link to="/editor" className="btn btn-primary">Создать</Link>
            <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
              Импортировать
            </button>
          </div>
        </div>
      ) : (
        <div className="tabs-list">
          {tabs.map(tab => (
            <div key={tab.id} className="tab-item card">
              <div className="tab-item-main">
                <Link to={`/tab/${tab.id}`} className="tab-item-title">{tab.title}</Link>
                {tab.artist && <span className="tab-item-artist">{tab.artist}</span>}
              </div>
              <div className="tab-item-meta">
                <span className={`badge badge-${tab.instrument}`}>{INSTR_LABEL[tab.instrument]}</span>
                <span className="tab-item-date">
                  {new Date(tab.updated_at).toLocaleDateString('ru')}
                </span>
              </div>
              <div className="tab-item-actions">
                <Link to={`/editor/${tab.id}`} className="btn btn-secondary btn-sm">Ред.</Link>
                <button className="btn btn-danger btn-sm" onClick={() => requestDelete(tab)}>Уд.</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {pendingDelete && (
        <div className="delete-confirm-backdrop" role="presentation" onClick={cancelDelete}>
          <div
            className="delete-confirm-dialog card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-confirm-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="delete-confirm-title" style={{ margin: '0 0 8px', fontSize: 17 }}>Удалить таб?</h3>
            <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: 14, lineHeight: 1.45 }}>
              Точно удалить «{pendingDelete.title}»? Восстановить таб из приложения будет нельзя (если нет копии в файле).
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button type="button" className="btn btn-secondary" onClick={cancelDelete}>
                Отмена
              </button>
              <button type="button" className="btn btn-danger" onClick={confirmDelete}>
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
