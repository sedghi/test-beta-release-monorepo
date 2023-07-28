import { Types } from '@alireza-beta-monorepo/core';
import { point } from '../math';
import interpolateSegmentPoints from './interpolation/interpolateSegmentPoints';

export function shouldInterpolate(configuration: Record<any, any>): boolean {
  return (
    configuration?.interpolation?.interpolateOnAdd === true ||
    configuration?.interpolation?.interpolateOnEdit === true
  );
}

/**
 * Tells whether two points are equal by proximity or not as far as interpolation goes.
 */
function isEqualByProximity(pointA, pointB) {
  return point.distanceToPoint(pointA, pointB) < 0.001;
}

/**
 * Tells whether two points are strictly equal or not as far as interpolation goes.
 */
function isEqual(pointA, pointB) {
  return point.distanceToPoint(pointA, pointB) === 0;
}

/**
 * Finds the indexes of points list and otherPoints list that points are identical.
 */
function findMatchIndexes(
  points: Types.Point2[],
  otherPoints: Types.Point2[]
): [number, number] | undefined {
  for (let i = 0; i < points.length; i++) {
    for (let j = 0; j < otherPoints.length; j++) {
      if (isEqual(points[i], otherPoints[j])) {
        return [i, j];
      }
    }
  }
}
/**
 * Returns the following index value (on circular basis) of index param on the given direction.
 */
function followingIndex(
  index: number,
  size: number,
  direction: number
): number {
  return (index + size + direction) % size;
}
/**
 * Array of params to be used on circular find next index.
 * The values respresent start index, indexDelimiter, list of points
 */
type ListParamsType = [number, number, Types.Point2[]];

/**
 * Circular finding that returns the next index for two list where the criteria is met.
 *
 * It can compare two lists out of sync considering it does a circular iteration over them.
 *
 * @example
 *
 * ```
 * const pointsA = [[0, 1], [1, 3], [1, 5], [1,2]];
 * const pointsB = [[1, 2], [1, 5], [1, 3], [0,0]];
 * let firstParam = [0, 0, pointsA]
 * let secondParam = [1, 1, pointsB]
 * const criteria = (pointA, pointB) => areSamePosition(pointA, pointB)
 * const direction = 1;
 * let result = circularFindNextIndexBy(firstParam, secondParam, criteria,direction);
 * console.log(result);
 * // prints [1, 2]
 * // use this result and find again
 * firstParam = [result[0]+1, result[0], pointsA]
 * secondParam = [result[1]+1, result[1], pointsB]
 * result = circularFindNextIndexBy(firstParam, secondParam, criteria,direction);
 * * // prints [3, 0]
 *
 */
function circularFindNextIndexBy(
  listParams: ListParamsType,
  otherListParams: ListParamsType,
  criteria: (pointA: Types.Point2, pointB: Types.Point2) => boolean,
  direction: number
): [number | undefined, number | undefined] {
  const [, indexDelimiter, points] = listParams;
  const [, otherIndexDelimiter, otherPoints] = otherListParams;

  const pointsLength = points.length;
  const otherPointsLength = otherPoints.length;

  let startIndex = listParams[0];
  let otherStartIndex = otherListParams[0];

  if (
    !points[startIndex] ||
    !otherPoints[otherStartIndex] ||
    !points[indexDelimiter] ||
    !otherPoints[otherIndexDelimiter]
  ) {
    return [undefined, undefined];
  }

  while (
    startIndex !== indexDelimiter &&
    otherStartIndex !== otherIndexDelimiter
  ) {
    if (criteria(otherPoints[otherStartIndex], points[startIndex])) {
      return [startIndex, otherStartIndex];
    }

    startIndex = followingIndex(startIndex, pointsLength, direction);
    otherStartIndex = followingIndex(
      otherStartIndex,
      otherPointsLength,
      direction
    );
  }

  return [undefined, undefined];
}

/**
 * Given two list it will find the first and last index of segment from points that diverges from previousPoints
 */
function findChangedSegment(
  points: Types.Point2[],
  previousPoints: Types.Point2[]
): [number, number] {
  const [firstMatchIndex, previousFirstMatchIndex] =
    findMatchIndexes(points, previousPoints) || [];

  const toBeNotEqualCriteria = (pointA, pointB) =>
    isEqualByProximity(pointA, pointB) === false;

  const [lowDiffIndex, lowOtherDiffIndex] = circularFindNextIndexBy(
    [
      followingIndex(firstMatchIndex, points.length, 1),
      firstMatchIndex,
      points,
    ],
    [
      followingIndex(previousFirstMatchIndex, previousPoints.length, 1),
      previousFirstMatchIndex,
      previousPoints,
    ],
    toBeNotEqualCriteria,
    1
  );

  const [highIndex] = circularFindNextIndexBy(
    [followingIndex(lowDiffIndex, points.length, -1), lowDiffIndex, points],
    [
      followingIndex(lowOtherDiffIndex, previousPoints.length, -1),
      lowOtherDiffIndex,
      previousPoints,
    ],
    toBeNotEqualCriteria,
    -1
  );

  return [lowDiffIndex, highIndex];
}

/**
 * Interpolates the given list of points. In case there is a pointsOfReference the interpolation will occur only on segment disjoint of two list. I.e list of points from param points that are not on list of points from param pointsOfReference.
 */
export function getInterpolatedPoints(
  configuration: Record<any, any>,
  points: Types.Point2[],
  pointsOfReference?: Types.Point2[]
): Types.Point2[] {
  const { interpolation } = configuration;

  const result = points;

  if (interpolation) {
    const {
      knotsRatioPercentageOnAdd,
      knotsRatioPercentageOnEdit,
      interpolateOnAdd = false,
      interpolateOnEdit = false,
    } = interpolation;

    const knotsRatioPercentage = pointsOfReference
      ? knotsRatioPercentageOnEdit
      : knotsRatioPercentageOnAdd;
    const isEnabled = pointsOfReference ? interpolateOnEdit : interpolateOnAdd;

    if (isEnabled) {
      // partial or total interpolation
      const [changedIniIndex, changedEndIndex] = pointsOfReference
        ? findChangedSegment(points, pointsOfReference)
        : [0, points.length - 1];

      // do not interpolate if there is no valid segment
      if (!points[changedIniIndex] || !points[changedEndIndex]) {
        return points;
      }

      return <Types.Point2[]>(
        interpolateSegmentPoints(
          points,
          changedIniIndex,
          changedEndIndex,
          knotsRatioPercentage
        )
      );
    }
  }

  return result;
}
