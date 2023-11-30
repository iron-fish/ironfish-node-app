declare global {
  interface Navigator {
    windowControlsOverlay: WindowControlsOverlay;
  }

  interface WindowControlsOverlay
    extends EventTarget,
      WindowControlsOverlayEventHandlers {
    visible: boolean;
    getTitlebarAreaRect: () => DOMRect;

    addEventListener<
      K extends keyof WindowControlsOverlayEventHandlersEventMap,
    >(
      type: K,
      listener: (
        this: WindowControlsOverlayEventHandlers,
        ev: WindowControlsOverlayEventHandlersEventMap[K],
      ) => unknown,
      options?: boolean | AddEventListenerOptions,
    ): void;
    addEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ): void;
    removeEventListener<
      K extends keyof WindowControlsOverlayEventHandlersEventMap,
    >(
      type: K,
      listener: (
        this: WindowControlsOverlayEventHandlers,
        ev: WindowControlsOverlayEventHandlersEventMap[K],
      ) => unknown,
      options?: boolean | EventListenerOptions,
    ): void;
    removeEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | EventListenerOptions,
    ): void;
  }

  interface WindowControlsOverlayEventHandlersEventMap {
    geometrychange: Event;
  }

  interface WindowControlsOverlayEventHandlers {
    /** [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/WindowControlsOverlay/geometrychange_event) */
    ongeometrychange:
      | ((this: WindowControlsOverlayEventHandlers, ev: Event) => unknown)
      | null;
    addEventListener<
      K extends keyof WindowControlsOverlayEventHandlersEventMap,
    >(
      type: K,
      listener: (
        this: WindowControlsOverlayEventHandlers,
        ev: WindowControlsOverlayEventHandlersEventMap[K],
      ) => unknown,
      options?: boolean | AddEventListenerOptions,
    ): void;
    addEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ): void;
    removeEventListener<
      K extends keyof WindowControlsOverlayEventHandlersEventMap,
    >(
      type: K,
      listener: (
        this: WindowControlsOverlayEventHandlers,
        ev: WindowControlsOverlayEventHandlersEventMap[K],
      ) => unknown,
      options?: boolean | EventListenerOptions,
    ): void;
    removeEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | EventListenerOptions,
    ): void;
  }
}

export {};
