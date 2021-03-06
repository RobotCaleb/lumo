'use strict';

const assert = require('assert');
const sinon = require('sinon');
const EventType = require('../../src/event/EventType');
const Layer = require('../../src/layer/Layer');
const Renderer = require('../../src/renderer/Renderer');

const noop = function() {};

describe('Layer', () => {

	let plot;
	let renderer;

	beforeEach(() => {
		plot = {
			setDirty: function() {}
		};
		renderer = new Renderer();
	});

	describe('#constructor()', () => {
		it('should accept no argument', () => {
			const layer = new Layer();
			assert(layer.getOpacity() === 1.0);
			assert(layer.isHidden() === false);
			assert(layer.getZIndex() === 0);
		});
		it('should accept an optional `options` argument', () => {
			const layer = new Layer({
				opacity: 0.123,
				hidden: true,
				zIndex: 4
			});
			assert(layer.getOpacity() === 0.123);
			assert(layer.isHidden() === true);
			assert(layer.getZIndex() === 4);
		});
	});

	describe('#setRenderer()', () => {
		it('should set the renderer property of the layer', () => {
			const layer = new Layer();
			layer.setRenderer(renderer);
			assert(layer.renderer === renderer);
		});
		it('should replace a previously existing renderer', () => {
			const layer = new Layer();
			const rendererA = {};
			const rendererB = {};
			layer.setRenderer(rendererA);
			layer.setRenderer(rendererB);
			assert(layer.renderer === rendererB);
		});
		it('should call `onAdd` on the renderer if the layer is attached to a plot', () => {
			const layer = new Layer();
			layer.onAdd(plot);
			const onAdd = sinon.stub(renderer, 'onAdd').callsFake(noop);
			layer.setRenderer(renderer);
			assert(onAdd.calledOnce);
		});
		it('should call `onRemove` on the previous renderer if the layer is attached to a plot', () => {
			const layer = new Layer();
			layer.onAdd(plot);
			const onRemove = sinon.stub(renderer, 'onRemove').callsFake(noop);
			layer.setRenderer(renderer);
			layer.setRenderer(new Renderer());
			assert(onRemove.calledOnce);
		});
		it('should throw an exception if no renderer is provided', () => {
			let threw = false;
			try {
				const layer = new Layer();
				layer.setRenderer();
			} catch (e) {
				threw = true;
			}
			assert(threw);
		});
	});

	describe('#removeRenderer()', () => {
		it('should remove the attached renderer', () => {
			const layer = new Layer();
			layer.setRenderer(renderer);
			layer.removeRenderer();
			assert(layer.renderer === null);
		});
		it('should call `onRemove` on the attached renderer if the layer is attached to a plot', () => {
			const layer = new Layer();
			layer.onAdd(plot);
			const onRemove = sinon.stub(renderer, 'onRemove').callsFake(noop);
			layer.setRenderer(renderer);
			layer.removeRenderer();
			assert(onRemove.calledOnce);
		});
		it('should throw an exception if there is no renderer attached', () => {
			let threw = false;
			try {
				const layer = new Layer();
				layer.removeRenderer();
			} catch (e) {
				threw = true;
			}
			assert(threw);
		});
	});

	describe('#draw()', () => {
		it('should do nothing if there is no attached renderer', () => {
			const layer = new Layer();
			layer.draw();
			layer.hide();
			layer.draw();
		});
		it('should call `draw` on the attached renderer', () => {
			const layer = new Layer();
			layer.setRenderer(renderer);
			const draw = sinon.stub(renderer, 'draw').callsFake(noop);
			layer.draw();
			assert(draw.calledOnce);
		});
	});

	describe('#onAdd()', () => {
		it('should set the plot property of the layer', () => {
			const layer = new Layer();
			layer.onAdd(plot);
			assert(layer.plot === plot);
		});
		it('should throw an exception if there is no plot provided', () => {
			let threw = false;
			try {
				const layer = new Layer();
				layer.onAdd();
			} catch (e) {
				threw = true;
			}
			assert(threw);
		});
		it('should flag the plot as dirty', () => {
			const layer = new Layer();
			const setDirty = sinon.stub(plot, 'setDirty');
			layer.onAdd(plot);
			assert(setDirty.called);
		});
	});

	describe('#onRemove()', () => {
		it('should remove the plot property from the layer', () => {
			const layer = new Layer();
			layer.onAdd(plot);
			layer.onRemove(plot);
			assert(layer.plot === null);
		});
		it('should throw an exception if there is no plot provided', () => {
			let threw = false;
			try {
				const layer = new Layer();
				layer.onRemove();
			} catch (e) {
				threw = true;
			}
			assert(threw);
		});
		it('should flag the plot as dirty', () => {
			const layer = new Layer();
			layer.onAdd(plot);
			const setDirty = sinon.stub(plot, 'setDirty');
			layer.onRemove(plot);
			assert(setDirty.called);
		});
	});

	describe('#show()', () => {
		it('should unhide the layer', () => {
			const layer = new Layer();
			layer.hide();
			assert(layer.isHidden() === true);
			layer.show();
			assert(layer.isHidden() === false);
		});
		it('should flag the plot as dirty if attached and is hidden', () => {
			const layer = new Layer();
			layer.onAdd(plot);
			layer.hide();
			const setDirty = sinon.stub(plot, 'setDirty');
			layer.show();
			assert(setDirty.called);
		});
		it('should not flag the plot as dirty if the layer is already not hidden', () => {
			const layer = new Layer();
			layer.onAdd(plot);
			layer.show();
			const setDirty = sinon.stub(plot, 'setDirty');
			layer.show();
			assert(!setDirty.called);
		});
	});

	describe('#hide()', () => {
		it('should hide the layer', () => {
			const layer = new Layer();
			layer.show();
			assert(layer.isHidden() === false);
			layer.hide();
			assert(layer.isHidden() === true);
		});
		it('should call `clear` on the attached renderer', () => {
			const layer = new Layer();
			layer.setRenderer(renderer);
			const clear = sinon.stub(renderer, 'clear');
			layer.hide();
			assert(clear.called);
		});
		it('should flag the plot as dirty if attached and is not hidden', () => {
			const layer = new Layer();
			layer.onAdd(plot);
			layer.show();
			const setDirty = sinon.stub(plot, 'setDirty');
			layer.hide();
			assert(setDirty.called);
		});
		it('should not flag the plot as dirty if the layer is already hidden', () => {
			const layer = new Layer();
			layer.onAdd(plot);
			layer.hide();
			const setDirty = sinon.stub(plot, 'setDirty');
			layer.hide();
			assert(!setDirty.called);
		});
	});

	describe('#isHidden()', () => {
		it('should return true if the layer is hidden', () => {
			const layer = new Layer();
			layer.hide();
			assert(layer.isHidden() === true);
		});
		it('should return false if the layer is not hidden', () => {
			const layer = new Layer();
			layer.show();
			assert(layer.isHidden() === false);
		});
	});

	describe('#setOpacity()', () => {
		it('should set the opacity of the layer', () => {
			const layer = new Layer();
			layer.setOpacity(0.5);
			assert(layer.getOpacity() === 0.5);
		});
		it('should flag the plot as dirty if attached if opacity is changed', () => {
			const layer = new Layer();
			layer.onAdd(plot);
			const setDirty = sinon.stub(plot, 'setDirty');
			layer.setOpacity(0.5);
			assert(setDirty.called);
		});
		it('should not flag the plot as dirty if opacity is not changed', () => {
			const layer = new Layer();
			layer.onAdd(plot);
			layer.setOpacity(0.5);
			const setDirty = sinon.stub(plot, 'setDirty');
			layer.setOpacity(0.5);
			assert(!setDirty.called);
		});
	});

	describe('#getOpacity()', () => {
		it('should return the opacity of the layer', () => {
			const layer = new Layer();
			layer.setOpacity(0.3);
			assert(layer.getOpacity() === 0.3);
		});
	});

	describe('#setZIndex()', () => {
		it('should set the z-index of the layer', () => {
			const layer = new Layer();
			layer.setZIndex(5);
			assert(layer.getZIndex() === 5);
		});
		it('should flag the plot as dirty if attached and z-index is changed', () => {
			const layer = new Layer();
			layer.onAdd(plot);
			const setDirty = sinon.stub(plot, 'setDirty');
			layer.setZIndex(5);
			assert(setDirty.called);
		});
		it('should not flag the plot as dirty z-index is not changed', () => {
			const layer = new Layer();
			layer.onAdd(plot);
			layer.setZIndex(5);
			const setDirty = sinon.stub(plot, 'setDirty');
			layer.setZIndex(5);
			assert(!setDirty.called);
		});
	});

	describe('#getZIndex()', () => {
		it('should return the z-index of the layer', () => {
			const layer = new Layer();
			layer.setZIndex(3);
			assert(layer.getZIndex() === 3);
		});
	});

	describe('#pick()', () => {
		it('should call `pick` on the attached renderer', () => {
			const layer = new Layer();
			layer.setRenderer(renderer);
			const pick = sinon.stub(layer.getRenderer(), 'pick').callsFake(noop);
			layer.pick();
			assert(pick.calledOnce);
		});
		it('should return null if no renderer is attached', () => {
			const layer = new Layer();
			const res = layer.pick();
			assert(res === null);
		});
	});

	describe('#highlight()', () => {
		it('should set the highlighted data of the layer', () => {
			const layer = new Layer();
			const data = {};
			layer.highlight(data);
			assert(layer.getHighlighted() === data);
		});
		it('should flag the plot as dirty if attached and highlight is new', () => {
			const layer = new Layer();
			layer.onAdd(plot);
			const setDirty = sinon.stub(plot, 'setDirty');
			layer.highlight({});
			assert(setDirty.called);
		});
		it('should not flag the plot as dirty if data is already highlighted', () => {
			const layer = new Layer();
			layer.onAdd(plot);
			const data = {};
			layer.highlight(data);
			const setDirty = sinon.stub(plot, 'setDirty');
			layer.highlight(data);
			assert(!setDirty.called);
		});
	});

	describe('#unhighlight()', () => {
		it('should clear the highlighted data of the layer', () => {
			const layer = new Layer();
			const data = {};
			layer.highlight(data);
			layer.unhighlight();
			assert(layer.getHighlighted() === null);
		});
		it('should flag the plot as dirty if attached and data is highlighted', () => {
			const layer = new Layer();
			layer.onAdd(plot);
			layer.highlight({});
			const setDirty = sinon.stub(plot, 'setDirty');
			layer.unhighlight();
			assert(setDirty.called);
		});
	});

	describe('#getHighlighted()', () => {
		it('should return the highlighted data of the layer', () => {
			const layer = new Layer();
			const data = {};
			layer.highlight(data);
			assert(layer.getHighlighted() === data);
		});
	});

	describe('#isHighlighted()', () => {
		it('should return `true` if the provided argument is highlighted', () => {
			const layer = new Layer();
			const data = {};
			layer.highlight(data);
			assert(layer.isHighlighted(data) === true);
		});
		it('should return `false` if the provided argument is not highlighted', () => {
			const layer = new Layer();
			const data = {};
			layer.unhighlight();
			assert(layer.isHighlighted(data) === false);
		});
	});

	describe('#select()', () => {
		it('should set the selected data of the layer', () => {
			const layer = new Layer();
			const data = {};
			layer.select(data);
			assert(layer.getSelected()[0] === data);
		});
		it('should add additional data entries if multiSelect is `true`', () => {
			const layer = new Layer();
			const data0 = {};
			const data1 = {};
			const data2 = {};
			layer.select(data0, true);
			layer.select(data1, true);
			layer.select(data2, true);
			assert(layer.getSelected()[0] === data0);
			assert(layer.getSelected()[1] === data1);
			assert(layer.getSelected()[2] === data2);
		});
		it('should not select duplicate data', () => {
			const layer = new Layer();
			const data = {};
			layer.select(data, true);
			layer.select(data, true);
			layer.select(data, true);
			assert(layer.getSelected()[0] === data);
			assert(layer.getSelected().length === 1);
		});
		it('should replace existing data entries if multiSelect is `false`', () => {
			const layer = new Layer();
			const data0 = {};
			const data1 = {};
			layer.select(data0);
			assert(layer.getSelected()[0] === data0);
			layer.select(data1);
			assert(layer.getSelected()[0] === data1);
		});
		it('should flag the plot as dirty if attached and data is selected', () => {
			const layer = new Layer();
			layer.onAdd(plot);
			const setDirty = sinon.stub(plot, 'setDirty');
			layer.select({});
			assert(setDirty.called);
		});
		it('should not flag the plot as dirty if data is already selected', () => {
			const layer = new Layer();
			layer.onAdd(plot);
			const data = {};
			layer.select(data);
			const setDirty = sinon.stub(plot, 'setDirty');
			layer.select(data);
			assert(!setDirty.called);
		});
	});

	describe('#unselect()', () => {
		it('should unselect the provided data', () => {
			const layer = new Layer();
			const data = {};
			layer.select(data);
			layer.unselect(data);
			assert(!layer.isSelected(data));
		});
		it('should flag the plot as dirty if attached and data is selected', () => {
			const layer = new Layer();
			layer.onAdd(plot);
			const data = {};
			layer.select(data);
			const setDirty = sinon.stub(plot, 'setDirty');
			layer.unselect(data);
			assert(setDirty.called);
		});
		it('should not flag the plot as dirty if data is not selected', () => {
			const layer = new Layer();
			layer.onAdd(plot);
			const setDirty = sinon.stub(plot, 'setDirty');
			layer.unselect({});
			assert(!setDirty.called);
		});
	});

	describe('#unselectAll()', () => {
		it('should empty the selection of the layer', () => {
			const layer = new Layer();
			layer.select({});
			layer.select({});
			layer.select({});
			layer.unselectAll();
			assert(layer.getSelected().length === 0);
		});
		it('should flag the plot as dirty if attached and data is selected', () => {
			const layer = new Layer();
			layer.onAdd(plot);
			const data = {};
			layer.select(data);
			const setDirty = sinon.stub(plot, 'setDirty');
			layer.unselectAll();
			assert(setDirty.called);
		});
		it('should not flag the plot as dirty if data is not selected', () => {
			const layer = new Layer();
			layer.onAdd(plot);
			const setDirty = sinon.stub(plot, 'setDirty');
			layer.unselectAll();
			assert(!setDirty.called);
		});
	});

	describe('#getSelected()', () => {
		it('should return the array of selected data entries', () => {
			const layer = new Layer();
			const data = {};
			layer.select(data);
			assert(layer.getSelected()[0] === data);
		});
	});

	describe('#isSelected()', () => {
		it('should return `true` if the provided argument is selected', () => {
			const layer = new Layer();
			const data = {};
			layer.select(data);
			assert(layer.isSelected(data) === true);
		});
		it('should return `false` if the provided argument is not selected', () => {
			const layer = new Layer();
			const data = {};
			layer.unselect();
			assert(layer.isSelected(data) === false);
		});
	});

	describe('#clear()', () => {
		it('should remove any highlighted or selected data', () => {
			const layer = new Layer();
			const data = {};
			layer.select(data);
			layer.highlight(data);
			layer.clear();
			assert(layer.getHighlighted() === null);
			assert(layer.getSelected().length === 0);
		});
		it('should flag the plot as dirty if attached', () => {
			const layer = new Layer();
			layer.onAdd(plot);
			layer.select({});
			layer.highlight({});
			const setDirty = sinon.stub(plot, 'setDirty');
			layer.clear();
			assert(setDirty.called);
		});
	});

	describe('#refresh()', () => {
		it('should clear the underlying layer', () => {
			const layer = new Layer();
			const clear = sinon.stub(layer, 'clear');
			layer.refresh();
			assert(clear.called);
		});
		it('should emit a `REFRESH` event from the layer', done => {
			const layer = new Layer();
			layer.on(EventType.REFRESH, () => {
				done();
			});
			layer.refresh();
		});
	});

});
