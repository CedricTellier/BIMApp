import { IfcViewerAPI } from "web-ifc-viewer";
import { Color } from "three";

// Get div container where 3d scene is rendered
const container = document.getElementById("viewer-container");

// Initialize IFC.js API and add it as global variable
const viewer = new IfcViewerAPI({
    container,
    backgroundColor: new Color(231, 233, 234),
});
viewer.IFC.applyWebIfcConfig({
    COORDINATE_TO_ORIGIN: true,
    USE_FAST_BOOLS: true,
});
window.webIfcAPI = viewer;

// Set up scene
viewer.addAxes();
viewer.addGrid(50, 50);
viewer.IFC.setWasmPath("wasm/");
viewer.clipper.active = true;
let dimensionsActive = false;

// Add basic input logic
const handleKeyDown = (event) => {
    if (event.code === "KeyE") {
        dimensionsActive = !dimensionsActive;
        viewer.dimensions.active = dimensionsActive;
        viewer.dimensions.previewActive = dimensionsActive;
        viewer.IFC.unPrepickIfcItems();
        window.onmousemove = dimensionsActive
            ? null
            : viewer.IFC.prePickIfcItem;
    }
    if (event.code === "KeyD") {
        viewer.dimensions.create();
    }
    if (event.code === "KeyG") {
        viewer.clipper.createPlane();
    }
    if (event.code === "Delete") {
        viewer.dimensions.deleteAll();
        viewer.clipper.deletePlane();
        viewer.IFC.unpickIfcItems();
    }

    if (event.code === "KeyB") {
        viewer.IFC.showAllItems();
    }
    if (event.code === "KeyC") {
        viewer.IFC.hideAllItems();
    }
};
window.onkeydown = handleKeyDown;

// Highlight items when hovering over them
window.onmousemove = viewer.IFC.prePickIfcItem;

// Select items and log properties
window.ondblclick = async () => {
    const item = await viewer.IFC.pickIfcItem(true);
    if (item.modelID === undefined || item.id === undefined) return;
    console.log(await viewer.IFC.getProperties(item.modelID, item.id, true));
    console.log(await viewer.IFC.getSpatialStructure(item.modelID));
    viewer.IFC.getModelID();
};

const input = document.getElementById("file-input");

input.addEventListener(
    "change",

    async (changed) => {
        var start = new Date();
        const file = changed.target.files[0];
        const ifcURL = URL.createObjectURL(file);
        viewer.IFC.loadIfcUrl(ifcURL, true);
        viewer.addGrid();
        viewer.IFC.prePickIfcItem();
        viewer.IFC.pickIfcItem(true);
        viewer.IFC.highlight;

        var end = new Date();
        var loaded = (end.getTime() - start.getTime()) / 1000;
        alert("loaded time: " + loaded);
    },

    false
);
