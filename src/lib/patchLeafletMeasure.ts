import type * as Leaflet from 'leaflet';

/**
 * leaflet-measure uses an invisible capture marker; on Leaflet 1.8+ its
 * autoPanOnFocus pans the map on every measure click.
 * @see https://github.com/ljagis/leaflet-measure/issues/171
 */
export function patchLeafletMeasure(L: typeof Leaflet): void {
  const Measure = (L.Control as typeof L.Control & { Measure?: { include: (o: object) => void } })
    .Measure;
  if (!Measure?.include) return;

  Measure.include({
    _startMeasure: function (this: {
      _locked: boolean;
      _measureVertexes: Leaflet.FeatureGroup;
      _layer: Leaflet.LayerGroup;
      _map: Leaflet.Map;
      options: { captureZIndex: number };
      _captureMarker: Leaflet.Marker;
      _container: HTMLElement;
      _setCaptureMarkerIcon: () => void;
      _handleMapMouseOut: () => void;
      _handleMeasureDoubleClick: () => void;
      _handleMeasureClick: () => void;
      _centerCaptureMarker: () => void;
      _updateMeasureStartedNoPoints: () => void;
    }) {
      this._locked = true;
      this._measureVertexes = L.featureGroup().addTo(this._layer);
      this._captureMarker = L.marker(this._map.getCenter(), {
        clickable: true,
        zIndexOffset: this.options.captureZIndex,
        opacity: 0,
        autoPanOnFocus: false,
      }).addTo(this._layer);
      this._setCaptureMarkerIcon();

      this._captureMarker
        .on('mouseout', this._handleMapMouseOut, this)
        .on('dblclick', this._handleMeasureDoubleClick, this)
        .on('click', this._handleMeasureClick, this);

      this._map
        .on('mousemove', (this as { _handleMeasureMove: () => void })._handleMeasureMove, this)
        .on('mouseout', this._handleMapMouseOut, this)
        .on('move', this._centerCaptureMarker, this)
        .on('resize', this._setCaptureMarkerIcon, this);

      L.DomEvent.on(this._container, 'mouseenter', this._handleMapMouseOut, this);

      this._updateMeasureStartedNoPoints();
      this._map.fire('measurestart', null, false);
    },

    _setCaptureMarkerIcon: function (this: {
      _captureMarker: Leaflet.Marker;
      _map: Leaflet.Map;
    }) {
      this._captureMarker.options.autoPanOnFocus = false;
      this._captureMarker.setIcon(
        L.divIcon({
          iconSize: this._map.getSize().multiplyBy(2),
        }),
      );
    },
  });
}
