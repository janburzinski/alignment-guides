(() => {
  const existing = document.querySelector("[data-alignment-guides-root]");
  if (existing) {
    existing.__alignmentGuidesCleanup?.();
    existing.remove();
    return;
  }

  const root = document.createElement("div");
  root.dataset.alignmentGuidesRoot = "";
  root.innerHTML = `
    <div class="ag-ruler ag-ruler-x" title="Drag down to create a horizontal guide"></div>
    <div class="ag-ruler ag-ruler-y" title="Drag right to create a vertical guide"></div>
    <div class="ag-corner"></div>
    <div class="ag-toolbar">
      <button type="button" data-action="add-x" class="ag-secondary">+ Vertical</button>
      <button type="button" data-action="add-y" class="ag-secondary">+ Horizontal</button>
      <button type="button" data-action="auto">Auto align</button>
      <button type="button" data-action="clear" class="ag-secondary">Clear</button>
      <span class="ag-status">Drag from a ruler</span>
      <button type="button" data-action="close" class="ag-icon" aria-label="Close">×</button>
    </div>
    <div class="ag-guide-layer"></div>
  `;
  document.documentElement.append(root);

  const RULER_SIZE = 20;

  const layer = root.querySelector(".ag-guide-layer");
  const status = root.querySelector(".ag-status");
  const horizontalRuler = root.querySelector(".ag-ruler-x");
  const verticalRuler = root.querySelector(".ag-ruler-y");
  const autoButton = root.querySelector('[data-action="auto"]');
  let autoEnabled = false;
  let autoUpdateTimer;

  const setStatus = (message) => {
    status.textContent = message;
  };

  const positionGuide = (guide, position) => {
    const axis = guide.dataset.axis;
    const max = axis === "x" ? window.innerWidth : window.innerHeight;
    const bounded = Math.max(RULER_SIZE, Math.min(position, max));
    guide.style[axis === "x" ? "left" : "top"] = `${bounded}px`;
    guide.querySelector("span").textContent = `${Math.round(bounded)} px`;
  };

  let stopActiveDrag;

  const startDragging = (event, guide) => {
    event.preventDefault();
    guide.classList.add("ag-dragging");
    guide.setPointerCapture?.(event.pointerId);

    const move = (moveEvent) => {
      positionGuide(
        guide,
        guide.dataset.axis === "x" ? moveEvent.clientX : moveEvent.clientY,
      );
    };
    const stop = () => {
      stopActiveDrag = undefined;
      guide.classList.remove("ag-dragging");
      window.removeEventListener("pointermove", move, true);
      window.removeEventListener("pointerup", stop, true);
      window.removeEventListener("pointercancel", stop, true);
      setStatus("Double-click a guide to remove it");
    };

    stopActiveDrag = stop;
    window.addEventListener("pointermove", move, true);
    window.addEventListener("pointerup", stop, true);
    window.addEventListener("pointercancel", stop, true);
  };

  const addGuide = (axis, position, automatic = false) => {
    const guide = document.createElement("div");
    guide.className = `ag-guide ag-guide-${axis}${automatic ? " ag-auto" : ""}`;
    guide.dataset.axis = axis;
    guide.innerHTML = "<span></span>";
    positionGuide(guide, position);
    guide.addEventListener("pointerdown", (event) => {
      guide.classList.remove("ag-auto");
      startDragging(event, guide);
    });
    guide.addEventListener("dblclick", () => guide.remove());
    layer.append(guide);
    return guide;
  };

  const collectSharedPositions = (rects, axis) => {
    const positions = new Map();
    const viewportLimit = axis === "x" ? window.innerWidth : window.innerHeight;

    for (const rect of rects) {
      const values = axis === "x"
        ? [rect.left, rect.left + rect.width / 2, rect.right]
        : [rect.top, rect.top + rect.height / 2, rect.bottom];

      for (const value of values) {
        const rounded = Math.round(value / 2) * 2;
        if (rounded >= RULER_SIZE && rounded <= viewportLimit) {
          positions.set(rounded, (positions.get(rounded) || 0) + 1);
        }
      }
    }

    return [...positions.entries()]
      .filter(([, count]) => count >= 3)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .sort((a, b) => a[0] - b[0])
      .map(([position]) => position);
  };

  const autoAlign = () => {
    layer.querySelectorAll(".ag-auto").forEach((guide) => guide.remove());

    const seenRects = new Set();
    const styleCache = new WeakMap();
    const rectCache = new WeakMap();
    const getStyle = (element) => {
      if (!styleCache.has(element)) {
        styleCache.set(element, getComputedStyle(element));
      }
      return styleCache.get(element);
    };
    const getRect = (element) => {
      if (!rectCache.has(element)) {
        rectCache.set(element, element.getBoundingClientRect());
      }
      return rectCache.get(element);
    };
    const getVisibleRect = (element, rect) => {
      let visibleLeft = Math.max(rect.left, RULER_SIZE);
      let visibleTop = Math.max(rect.top, RULER_SIZE);
      let visibleRight = Math.min(rect.right, window.innerWidth);
      let visibleBottom = Math.min(rect.bottom, window.innerHeight);

      for (let current = element; current; current = current.parentElement) {
        const style = getStyle(current);
        if (
          style.visibility === "hidden" ||
          style.visibility === "collapse" ||
          style.display === "none" ||
          Number(style.opacity) === 0
        ) {
          return null;
        }

        if (current !== element) {
          const currentRect = getRect(current);
          const clipLeft = currentRect.left + current.clientLeft;
          const clipTop = currentRect.top + current.clientTop;
          const clipRight = clipLeft + current.clientWidth;
          const clipBottom = clipTop + current.clientHeight;
          if (style.overflowX !== "visible") {
            visibleLeft = Math.max(visibleLeft, clipLeft);
            visibleRight = Math.min(visibleRight, clipRight);
          }
          if (style.overflowY !== "visible") {
            visibleTop = Math.max(visibleTop, clipTop);
            visibleBottom = Math.min(visibleBottom, clipBottom);
          }
        }
      }

      if (visibleRight <= visibleLeft || visibleBottom <= visibleTop) {
        return null;
      }

      return {
        left: visibleLeft,
        top: visibleTop,
        right: visibleRight,
        bottom: visibleBottom,
        width: visibleRight - visibleLeft,
        height: visibleBottom - visibleTop,
      };
    };

    const rects = [...(document.body?.querySelectorAll("*") ?? [])]
      .filter((element) => !root.contains(element))
      .map((element) => getVisibleRect(element, getRect(element)))
      .filter((rect) => rect && rect.width >= 16 && rect.height >= 12)
      .filter((rect) => {
        const key = [rect.left, rect.top, rect.width, rect.height]
          .map((value) => Math.round(value * 2) / 2)
          .join(":");
        if (seenRects.has(key)) return false;
        seenRects.add(key);
        return true;
      })
      .slice(0, 1500);

    const xPositions = collectSharedPositions(rects, "x");
    const yPositions = collectSharedPositions(rects, "y");
    xPositions.forEach((position) => addGuide("x", position, true));
    yPositions.forEach((position) => addGuide("y", position, true));
    setStatus(`${xPositions.length + yPositions.length} live alignments`);
  };

  const scheduleAutoUpdate = () => {
    if (!autoEnabled) return;
    window.clearTimeout(autoUpdateTimer);
    autoUpdateTimer = window.setTimeout(autoAlign, 80);
  };

  const setAutoEnabled = (enabled) => {
    autoEnabled = enabled;
    autoButton.classList.toggle("ag-active", enabled);
    autoButton.setAttribute("aria-pressed", String(enabled));
    autoButton.textContent = enabled ? "Auto: on" : "Auto align";

    if (enabled) {
      autoAlign();
    } else {
      window.clearTimeout(autoUpdateTimer);
      layer.querySelectorAll(".ag-auto").forEach((guide) => guide.remove());
      setStatus("Live alignment paused");
    }
  };

  const mutationObserver = new MutationObserver(scheduleAutoUpdate);
  if (document.body) {
    mutationObserver.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
    });
  }
  window.addEventListener("resize", scheduleAutoUpdate);
  window.addEventListener("scroll", scheduleAutoUpdate, true);
  document.fonts?.addEventListener("loadingdone", scheduleAutoUpdate);

  root.__alignmentGuidesCleanup = () => {
    stopActiveDrag?.();
    window.clearTimeout(autoUpdateTimer);
    mutationObserver.disconnect();
    window.removeEventListener("resize", scheduleAutoUpdate);
    window.removeEventListener("scroll", scheduleAutoUpdate, true);
    document.fonts?.removeEventListener("loadingdone", scheduleAutoUpdate);
  };

  const onAction = (name, handler) => {
    root.querySelector(`[data-action="${name}"]`).addEventListener("click", handler);
  };

  horizontalRuler.addEventListener("pointerdown", (event) => {
    startDragging(event, addGuide("y", event.clientY));
  });
  verticalRuler.addEventListener("pointerdown", (event) => {
    startDragging(event, addGuide("x", event.clientX));
  });
  onAction("add-x", () => {
    addGuide("x", window.innerWidth / 2);
    setStatus("Drag the new vertical guide into place");
  });
  onAction("add-y", () => {
    addGuide("y", window.innerHeight / 2);
    setStatus("Drag the new horizontal guide into place");
  });
  onAction("auto", () => setAutoEnabled(!autoEnabled));
  onAction("clear", () => {
    setAutoEnabled(false);
    layer.replaceChildren();
    setStatus("All guides cleared");
  });
  onAction("close", () => {
    root.__alignmentGuidesCleanup();
    root.remove();
  });
})();
