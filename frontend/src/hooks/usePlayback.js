import { useState, useRef, useCallback, useEffect } from 'react';
import { BEATS_PER_MEASURE } from '../components/TabEditor/constants';

export default function usePlayback(totalMeasures, tempo = 120) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMeasure, setCurrentMeasure] = useState(0);
  const [currentBeat, setCurrentBeat] = useState(0);

  const timerRef = useRef(null);
  const measureRef = useRef(0);
  const beatRef = useRef(0);

  const sixteenthInterval = 60000 / (tempo * 4);

  const stop = useCallback(() => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    measureRef.current = 0;
    beatRef.current = 0;
    setCurrentMeasure(0);
    setCurrentBeat(0);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    let nextBeat = beatRef.current + 1;
    let nextMeasure = measureRef.current;

    if (nextBeat >= BEATS_PER_MEASURE) {
      nextBeat = 0;
      nextMeasure++;
    }

    if (nextMeasure >= totalMeasures) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      measureRef.current = 0;
      beatRef.current = 0;
      setCurrentMeasure(0);
      setCurrentBeat(0);
      setIsPlaying(false);
      return;
    }

    measureRef.current = nextMeasure;
    beatRef.current = nextBeat;
    setCurrentMeasure(nextMeasure);
    setCurrentBeat(nextBeat);
  }, [totalMeasures]);

  const play = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPlaying(true);
    timerRef.current = setInterval(tick, sixteenthInterval);
  }, [tick, sixteenthInterval]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  const seekTo = useCallback((measure, beat = 0) => {
    measureRef.current = measure;
    beatRef.current = beat;
    setCurrentMeasure(measure);
    setCurrentBeat(beat);
  }, []);

  useEffect(() => {
    if (isPlaying && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(tick, sixteenthInterval);
    }
  }, [sixteenthInterval, tick, isPlaying]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const progress = totalMeasures > 0
    ? ((currentMeasure * BEATS_PER_MEASURE + currentBeat) /
       (totalMeasures * BEATS_PER_MEASURE)) * 100
    : 0;

  return {
    isPlaying,
    currentMeasure,
    currentBeat,
    progress,
    play,
    pause,
    stop,
    togglePlay,
    seekTo,
  };
}
