"use strict";
figma.showUI(__html__, { width: 800, height: 500 });
const allowedSpacings = [0, 2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96, 160];
function isNodeVisible(node) {
    if (!node.visible) {
        return false;
    }
    if (node.parent &&
        node.parent.type !== "DOCUMENT" &&
        "visible" in node.parent) {
        return isNodeVisible(node.parent);
    }
    return true;
}
function getSelectedInstanceData() {
    let data = [];
    function exploreNode(node) {
        if (node.type === "INSTANCE") {
            const instanceNode = node;
            if (isNodeVisible(instanceNode)) {
                const instanceName = instanceNode.name || "Undefined";
                const instanceId = instanceNode.id;
                const mainComponent = instanceNode.mainComponent;
                let mainComponentName = "";
                let containsKeyword = false;
                if (mainComponent) {
                    mainComponentName =
                        mainComponent.parent &&
                            mainComponent.parent.type === "COMPONENT_SET"
                            ? mainComponent.parent.name
                            : mainComponent.name;
                    // check if "[ds-radar]"
                    containsKeyword = mainComponent.description.includes("[ds-radar]");
                }
                // check if component name has suffix
                const hasSuffix = mainComponentName.includes("") || containsKeyword;
                data.push({ instanceName, hasSuffix, instanceId });
            }
        }
        if ("children" in node) {
            node.children.forEach(exploreNode);
        }
    }
    figma.currentPage.selection.forEach(exploreNode);
    return data;
}
function analyzeStyles() {
    let totalNodes = 0;
    let boundNodes = 0;
    let unboundNodes = [];
    function nodeHasFillOrStroke(node) {
        const fills = "fills" in node ? node.fills : null;
        const hasVisibleFill = Array.isArray(fills) &&
            fills.some((fill) => fill.type === "SOLID" && fill.visible !== false);
        const strokes = "strokes" in node ? node.strokes : null;
        const hasVisibleStroke = Array.isArray(strokes) &&
            strokes.some((stroke) => stroke.type === "SOLID" && stroke.visible !== false);
        return hasVisibleFill || hasVisibleStroke;
    }
    function nodeIsBoundToVariable(node) {
        if ("boundVariables" in node) {
            const variables = node.boundVariables;
            for (const key in variables) {
                if (variables[key] !== undefined) {
                    return true;
                }
            }
        }
        return false;
    }
    function exploreNode(node) {
        if (!node.visible) {
            return;
        }
        if ("children" in node) {
            node.children.forEach(exploreNode);
        }
        if (nodeHasFillOrStroke(node)) {
            totalNodes++;
            if (nodeIsBoundToVariable(node)) {
                boundNodes++;
            }
            else {
                let rgbaColor = "N/A";
                const fills = "fills" in node ? node.fills : [];
                if (fills.length > 0 &&
                    fills[0].type === "SOLID" &&
                    fills[0].visible !== false) {
                    const color = fills[0].color;
                    const alpha = "opacity" in node ? node.opacity : 1;
                    rgbaColor = `rgba(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)}, ${alpha})`;
                }
                unboundNodes.push({ name: node.name, id: node.id, color: rgbaColor });
            }
        }
    }
    figma.currentPage.selection.forEach(exploreNode);
    return { totalNodes, boundNodes, unboundNodes };
}
function isSpacingConform(node) {
    if (node.type === "FRAME" ||
        node.type === "COMPONENT" ||
        node.type === "INSTANCE") {
        const frameNode = node;
        if ("itemSpacing" in frameNode &&
            allowedSpacings.indexOf(node.itemSpacing) === -1) {
            return false;
        }
        if ("paddingTop" in frameNode &&
            allowedSpacings.indexOf(node.paddingTop) === -1)
            return false;
        if ("paddingRight" in frameNode &&
            allowedSpacings.indexOf(node.paddingRight) === -1)
            return false;
        if ("paddingBottom" in frameNode &&
            allowedSpacings.indexOf(node.paddingBottom) === -1)
            return false;
        if ("paddingLeft" in frameNode &&
            allowedSpacings.indexOf(node.paddingLeft) === -1)
            return false;
    }
    return true;
}
function analyzeSpacing() {
    let nonConformNodes = [];
    const selection = figma.currentPage.selection;
    selection.forEach((node) => {
        if ((node.type === "FRAME" ||
            node.type === "INSTANCE" ||
            node.type === "COMPONENT") &&
            node.visible) {
            exploreNode(node, nonConformNodes, allowedSpacings);
        }
    });
    return nonConformNodes;
}
function checkAndAddSpacing(node, spacingValue, spacingProp, nonConformNodes) {
    if (spacingValue !== undefined &&
        allowedSpacings.indexOf(spacingValue) === -1) {
        nonConformNodes.push({
            name: node.name,
            id: node.id,
            spacing: spacingValue,
            spacingProp: spacingProp,
        });
    }
}
function exploreNode(node, nonConformNodes, allowedSpacings) {
    if (!node.visible)
        return;
    checkAndAddSpacing(node, node.itemSpacing, "itemSpacing", nonConformNodes);
    checkAndAddSpacing(node, node.paddingTop, "paddingTop", nonConformNodes);
    checkAndAddSpacing(node, node.paddingRight, "paddingRight", nonConformNodes);
    checkAndAddSpacing(node, node.paddingBottom, "paddingBottom", nonConformNodes);
    checkAndAddSpacing(node, node.paddingLeft, "paddingLeft", nonConformNodes);
    if ("children" in node) {
        node.children.forEach((child) => {
            if (child.type === "FRAME" ||
                child.type === "INSTANCE" ||
                child.type === "COMPONENT") {
                exploreNode(child, nonConformNodes, allowedSpacings);
            }
        });
    }
}
figma.ui.onmessage = (msg) => {
    if (msg.type === "analyze-selection") {
        const analysisResults = analyzeStyles();
        figma.ui.postMessage({
            type: "style-analysis-result",
            data: analysisResults,
        });
    }
    if (msg.type === "navigate-to-instance") {
        const instanceId = msg.instanceId;
        const instance = figma.getNodeById(instanceId);
        if (instance) {
            figma.currentPage.selection = [instance];
            figma.viewport.scrollAndZoomIntoView([instance]);
        }
    }
    if (msg.type === "get-data") {
        const data = getSelectedInstanceData();
        figma.ui.postMessage({ type: "instance-data", data });
    }
    if (msg.type === "navigate-to-node") {
        const nodeId = msg.nodeId;
        const node = figma.getNodeById(nodeId);
        if (node) {
            figma.currentPage.selection = [node];
            figma.viewport.scrollAndZoomIntoView([node]);
        }
    }
    if (msg.type === "analyze-dimensions") {
        const dimensionResults = analyzeSpacing();
        figma.ui.postMessage({
            type: "dimension-analysis-result",
            data: dimensionResults,
        });
    }
};
