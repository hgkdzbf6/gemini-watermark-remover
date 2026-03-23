import test from 'node:test';
import assert from 'node:assert/strict';
import { loadModuleSource } from '../testUtils/moduleStructure.js';

function getCreateImageCardBlock(source) {
    const match = String(source).match(/function createImageCard\(item\) \{[\s\S]*?\n\}/);
    assert.ok(match, 'expected createImageCard function to exist');
    return match[0];
}

test('createImageCard should not interpolate user-controlled filename into innerHTML', () => {
    const appSource = loadModuleSource('../../src/app.js', import.meta.url);
    const createImageCardSource = getCreateImageCardBlock(appSource);

    assert.equal(
        createImageCardSource.includes('${item.name}'),
        false,
        'expected createImageCard to avoid inserting item.name directly into the rendered HTML template'
    );
    assert.equal(
        createImageCardSource.includes("card.querySelector('.image-name')"),
        true,
        'expected createImageCard to query the filename node after DOM creation'
    );
    assert.equal(
        createImageCardSource.includes('imageName.textContent = item.name;'),
        true,
        'expected createImageCard to assign the filename through textContent after DOM creation'
    );
});
