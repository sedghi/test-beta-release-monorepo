import type { Types } from '@alireza-beta-monorepo/core';
import triggerAnnotationRender from './triggerAnnotationRender';

export function triggerAnnotationRenderForViewportIds(
  renderingEngine: Types.IRenderingEngine,
  viewportIdsToRender: string[]
): void {
  if (!viewportIdsToRender.length) {
    return;
  }

  viewportIdsToRender.forEach((viewportId) => {
    const { element } = renderingEngine.getViewport(viewportId);
    triggerAnnotationRender(element);
  });
}

export default triggerAnnotationRenderForViewportIds;
