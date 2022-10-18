export const createEventTarget = () => {
  const eventTarget: EventTarget = document.createElement('div');
  return {
    on: eventTarget.addEventListener.bind(eventTarget),
    off: eventTarget.removeEventListener.bind(eventTarget),
    emit: (type: string, data: any = undefined) => {
      return eventTarget.dispatchEvent(new CustomEvent(type, {
        detail: data,
      }));
    },
  };
};
