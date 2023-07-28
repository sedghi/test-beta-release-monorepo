import { getEnabledElement } from '@alireza-beta-monorepo/core';
import type { Types } from '@alireza-beta-monorepo/core';

/**
 * Remove the labelmap segmentation representation from the viewport's HTML Element.
 * NOTE: This function should not be called directly.
 *
 * @param element - The element that the segmentation is being added to.
 * @param segmentationRepresentationUID - The UID of the labelmap representation to remove.
 * @param removeFromCache - boolean
 *
 * @internal
 */
function removeLabelmapFromElement(
  element: HTMLDivElement,
  segmentationRepresentationUID: string,
  removeFromCache = false // Todo
): void {
  const enabledElement = getEnabledElement(element);
  const { viewport } = enabledElement;

  (viewport as Types.IVolumeViewport).removeVolumeActors([
    segmentationRepresentationUID,
  ]);
}

export default removeLabelmapFromElement;
