import { useRef, useState, useEffect, createElement } from 'react';

function ResponsiveDatagridTwo({
  breakpoints,
  dataGridWidget,
  DS,
  forceAutoFill,
  keepLastBoolean,
  RenderChevron,
  ...rest
}) {
  const style = rest.class || "";
  const datagridWidgetRef = useRef(null);
  const datagridRowsRef = useRef([]);
  const [tableContent, setTableContent] = useState(null);
  const [canRender, setCanRender] = useState(false);
  const [templateColumns, setTemplateColumns] = useState(null);
  const [screenMode, setScreenMode] = useState(null);
  const [maxColumns, setMaxColumns] = useState(100);
  const [widgetLoaded, setWidgetLoaded] = useState(false);
  const config = {
    // attributes: true,
    // attributeOldValue: true,
    childList: true,
    // This is a must have for the observer with subtree
    subtree: true // Set to true if changes must also be observed in descendants.
  };
  function screenSizeCheck() {
    const breakpointsMap = breakpoints.reduce((map, breakpoint) => {
      map[breakpoint.for] = breakpoint;
      return map;
    }, {});
    const {
      mobile,
      tablet,
      desktop
    } = breakpointsMap;
    const width = window.innerWidth;
    if (mobile !== undefined && width <= mobile.value) {
      setScreenMode("mobile");
      setMaxColumns(mobile.columns);
    } else if (tablet !== undefined && width <= tablet.value) {
      setScreenMode("tablet");
      setMaxColumns(tablet.columns);
    } else if (desktop !== undefined && width <= desktop.value) {
      setScreenMode("desktop");
      setMaxColumns(desktop.columns);
    } else {
      setScreenMode("large-desktop");
      setMaxColumns(100);
    }
  }
  function setGridColumns() {
    const columnArray = templateColumns.replace("grid-template-columns: ", "").split(/ (?![^()]*\))/);
    const maxColumnArray = columnArray.slice(0, columnArray.length - (columnArray.length - maxColumns) + (keepLastBoolean ? -1 : 0));
    if (keepLastBoolean) {
      maxColumnArray.push("fit-content(100%)");
    }
    if (RenderChevron === "right") {
      maxColumnArray.push("fit-content(100%)");
    } else {
      maxColumnArray.unshift("fit-content(100%)");
    }
    if (forceAutoFill) {
      maxColumnArray.splice(2, 1, "1fr");
    }
    tableContent.setAttribute("style", `grid-template-columns: ${maxColumnArray.join(" ").replace(";", "")};`);
  }
  function toggleTrCollapse(event, chevronBtn) {
    const notCollapsed = [...document.querySelectorAll(".tr-resp-collapsible:not(.tr-resp-collapsible--collapsed)")];
    if (notCollapsed.length) {
      notCollapsed.forEach(chevronRow => {
        const rowBtn = chevronRow.parentElement.querySelector(".btn-td-resp-collapse");
        if (rowBtn !== chevronBtn) {
          chevronRow.classList.toggle("tr-resp-collapsible--collapsed");
          chevronRow.parentElement.querySelector(".btn-td-resp-collapse").classList.toggle("btn-td-resp-collapse--active");
        }
      });
    }
    chevronBtn.classList.toggle("btn-td-resp-collapse--active");
    event.target.closest(".tr").querySelector(".tr-resp-collapsible").classList.toggle("tr-resp-collapsible--collapsed");
  }

  // Check the column to insert the chevron
  function renderChevron(row) {
    // Check first TH if there is no chevron present
    if (!row.querySelector(".th.chevron-th")) {
      const selectTH = RenderChevron === "left" ? row.querySelector(".th") : row.querySelector(`.th:nth-child(${maxColumns + 1})`);
      const extraTH = `<div class="th chevron-th" role="columnheader"><div class="column-container">&nbsp;</div></div>`;
      if (selectTH && selectTH.querySelector(".td-custom-content") && RenderChevron === "left") {
        selectTH.insertAdjacentHTML("afterend", extraTH);
      } else if (selectTH) {
        selectTH.insertAdjacentHTML("beforebegin", extraTH);
      }
    }

    // Check first TD if there is no chevron present
    if (!row.querySelector(".td.chevron-td")) {
      const selectTD = RenderChevron === "left" ? row.querySelector(".td") : row.querySelector(`.td:nth-child(${maxColumns + 1})`);
      const borderClass = row.querySelector(".td-borders") ? "td-borders " : "";
      const clickableClass = row.querySelector(".td.clickable") ? "clickable" : "";
      const extraTD = `<div class="td chevron-td btn-td-resp-collapse ${borderClass}${clickableClass}" role="gridcell"><div class="td-custom-content"><svg height="16" width="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M8.00004 11.1369C8.21033 11.1369 8.38741 11.0539 8.54789 10.8934L12.4935 6.85368C12.6208 6.72087 12.6872 6.56592 12.6872 6.37777C12.6872 5.9904 12.3829 5.68604 12.0066 5.68604C11.8239 5.68604 11.6469 5.76351 11.5085 5.90186L8.00557 9.50439L4.49158 5.90186C4.35876 5.76904 4.18722 5.68604 3.99353 5.68604C3.61723 5.68604 3.31287 5.9904 3.31287 6.37777C3.31287 6.56038 3.38481 6.72087 3.51208 6.85368L7.45772 10.8934C7.62374 11.0594 7.79529 11.1369 8.00004 11.1369Z"/></svg></div></div>`;
      if (selectTD && selectTD.querySelector(".td-custom-content") && RenderChevron === "left") {
        selectTD.insertAdjacentHTML("afterend", extraTD);
      } else if (selectTD) {
        selectTD.insertAdjacentHTML("beforebegin", extraTD);
      }
    }
  }
  function renderCollapsibleDiv(row) {
    const collapsibleDiv = `<div class="tr-resp-collapsible tr-resp-collapsible--collapsed"></div>`;
    if (!row.querySelector(".tr-resp-collapsible")) {
      row.insertAdjacentHTML("beforeend", collapsibleDiv);
    }
  }
  function moveColumnsInsideCollapsibleDiv(row) {
    const endIndex = keepLastBoolean ? -1 : 0;
    const THs = [...row.querySelectorAll(".th")];
    if (THs.length) {
      const startIndex = THs.length - (THs.length - maxColumns) + (keepLastBoolean ? -1 : 0);
      if (keepLastBoolean) {
        THs.slice(startIndex, endIndex).forEach(TH => {
          TH.classList.add("hidden");
        });
      } else {
        THs.slice(startIndex).forEach(TH => {
          TH.classList.add("hidden");
        });
      }
    }
    const TDs = [...row.querySelectorAll(".td")];
    if (TDs.length) {
      const startIndex = TDs.length - (TDs.length - maxColumns) + (keepLastBoolean ? -1 : 0);
      if (keepLastBoolean) {
        TDs.slice(startIndex, endIndex).forEach((TD, index) => {
          TD.classList.add("hidden");
          const headers = [...datagridWidgetRef.current.querySelectorAll('.widget-datagrid .tr[role="row"]:first-child .th.hidden')];
          const collapsible = row.querySelector(".tr-resp-collapsible");
          const collapsibleContent = `<div class="tr-resp-collapsible__item">
                        <p class="td-text text-bold nomargin">${headers[index]?.querySelector("span").innerHTML}</p>
                            <span class="td-text">${TD.querySelector("span")?.innerHTML}</span>
                        </div>`;
          collapsible.insertAdjacentHTML("beforeend", collapsibleContent);
        });
      } else {
        TDs.slice(startIndex).forEach((TD, index) => {
          TD.classList.add("hidden");
          const headers = [...datagridWidgetRef.current.querySelectorAll('.widget-datagrid .tr[role="row"]:first-child .th.hidden')];
          const collapsible = row.querySelector(".tr-resp-collapsible");
          const collapsibleContent = `<div class="tr-resp-collapsible__item">
                    <p class="td-text text-bold nomargin">${headers[index]?.querySelector("span").innerHTML}</p>
                        <span class="td-text">${TD.querySelector("span")?.innerHTML}</span>
                    </div>`;
          collapsible.insertAdjacentHTML("beforeend", collapsibleContent);
        });
      }
    }
  }
  function renderElements() {
    // Process each row
    datagridRowsRef.current.forEach(row => {
      renderCollapsibleDiv(row);
      moveColumnsInsideCollapsibleDiv(row);
      renderChevron(row);
    });
    const chevronBtns = [...datagridWidgetRef.current.querySelectorAll(".btn-td-resp-collapse")];
    chevronBtns.forEach(chevronBtn => chevronBtn.addEventListener("click", event => toggleTrCollapse(event, chevronBtn)));
  }
  function resetCollapsibles() {
    const allCollapsibles = [...datagridWidgetRef.current.querySelectorAll(".tr-resp-collapsible")];
    allCollapsibles.forEach(collapsible => collapsible.remove());
  }
  function resetHiddenColumns() {
    const hiddenColumns = [...datagridWidgetRef.current.querySelectorAll(".th.hidden, .td.hidden")];
    hiddenColumns.forEach(hiddenColumn => hiddenColumn.classList.remove("hidden"));
  }
  function resetChevrons() {
    const rows = [...datagridWidgetRef.current.querySelectorAll('.tr[role="row"]')];
    rows.forEach(row => {
      row.querySelector(".th.chevron-th")?.remove();
      row.querySelector(".td.chevron-td")?.remove();
    });
  }
  function onSort() {
    setTimeout(() => {
      resetCollapsibles();
      resetHiddenColumns();
      resetChevrons();
      renderElements();
    }, 100);
  }
  useEffect(() => {
    if (canRender && screenMode) {
      const headers = [...datagridRowsRef.current[0].querySelectorAll(".th")];

      // For desktop leave / restore default. For other situations update to mobile / tablet columns
      if (screenMode === "large-desktop") {
        tableContent.setAttribute("style", templateColumns);
        resetCollapsibles();
        resetHiddenColumns();
        resetChevrons();
      } else {
        setGridColumns();
        resetCollapsibles();
        resetHiddenColumns();
        resetChevrons();
        renderElements();
        headers.forEach(header => header.addEventListener("click", onSort));
      }
    }

    // Detect a change in Data grid 2 after the initial rendering of everything
    const observer = new MutationObserver(() => {
      observer.disconnect();
      if (datagridRowsRef.current !== datagridWidgetRef.current.querySelectorAll(".tr[role=row]")) {
        datagridRowsRef.current = [...datagridWidgetRef.current.querySelectorAll(".tr[role=row]")];
        if (screenMode !== "large-desktop") {
          resetCollapsibles();
          resetHiddenColumns();
          resetChevrons();
          renderElements();
        }
      }
      observer.observe(datagridWidgetRef.current, config);
    });
    if (datagridWidgetRef && datagridWidgetRef.current) {
      observer.observe(datagridWidgetRef.current, config);
    }
    return () => observer.disconnect();
  });
  useEffect(() => {
    if (DS && DS.status === "available" && widgetLoaded === true) {
      if (datagridRowsRef.current !== datagridWidgetRef.current.querySelectorAll(".tr[role=row]")) {
        datagridRowsRef.current = [...datagridWidgetRef.current.querySelectorAll(".tr[role=row]")];
        setTimeout(() => {
          if (screenMode !== "large-desktop") {
            resetCollapsibles();
            resetHiddenColumns();
            resetChevrons();
            renderElements();
          }
        }, 200);
      }
    }
  });
  useEffect(() => {
    const observer = new MutationObserver(() => {
      observer.disconnect();
      if (datagridWidgetRef.current) {
        setTableContent(datagridWidgetRef.current.querySelector(".widget-datagrid .widget-datagrid-grid-body"));
      }
      observer.observe(datagridWidgetRef.current, config);
    });
    if (datagridWidgetRef && datagridWidgetRef.current) {
      observer.observe(datagridWidgetRef.current, config);
    }
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (tableContent) {
      setTemplateColumns(tableContent.getAttribute("style"));
      screenSizeCheck();
      setCanRender(true);
    }
  }, [tableContent]);
  useEffect(() => {
    if (canRender) {
      screenSizeCheck();
      window.addEventListener("resize", screenSizeCheck);
      setWidgetLoaded(true);
      return () => window.removeEventListener("resize", screenSizeCheck);
    }
  }, [canRender]);
  return createElement("div", {
    className: `responsive-datagrid ${style}`,
    ref: datagridWidgetRef
  }, dataGridWidget);
}

export { ResponsiveDatagridTwo };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzcG9uc2l2ZURhdGFncmlkVHdvLm1qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL1Jlc3BvbnNpdmVEYXRhZ3JpZFR3by5qc3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFwiLi91aS9SZXNwb25zaXZlRGF0YWdyaWRUd28uY3NzXCI7XG5pbXBvcnQgeyBjcmVhdGVFbGVtZW50LCB1c2VFZmZlY3QsIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIFJlc3BvbnNpdmVEYXRhZ3JpZFR3byh7XG4gICAgYnJlYWtwb2ludHMsXG4gICAgZGF0YUdyaWRXaWRnZXQsXG4gICAgRFMsXG4gICAgZm9yY2VBdXRvRmlsbCxcbiAgICBrZWVwTGFzdEJvb2xlYW4sXG4gICAgUmVuZGVyQ2hldnJvbixcbiAgICAuLi5yZXN0XG59KSB7XG4gICAgY29uc3Qgc3R5bGUgPSByZXN0LmNsYXNzIHx8IFwiXCI7XG4gICAgY29uc3QgZGF0YWdyaWRXaWRnZXRSZWYgPSB1c2VSZWYobnVsbCk7XG4gICAgY29uc3QgZGF0YWdyaWRSb3dzUmVmID0gdXNlUmVmKFtdKTtcbiAgICBjb25zdCBbdGFibGVDb250ZW50LCBzZXRUYWJsZUNvbnRlbnRdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW2NhblJlbmRlciwgc2V0Q2FuUmVuZGVyXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCBbdGVtcGxhdGVDb2x1bW5zLCBzZXRUZW1wbGF0ZUNvbHVtbnNdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW3NjcmVlbk1vZGUsIHNldFNjcmVlbk1vZGVdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW21heENvbHVtbnMsIHNldE1heENvbHVtbnNdID0gdXNlU3RhdGUoMTAwKTtcbiAgICBjb25zdCBbd2lkZ2V0TG9hZGVkLCBzZXRXaWRnZXRMb2FkZWRdID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IGNvbmZpZyA9IHtcbiAgICAgICAgLy8gYXR0cmlidXRlczogdHJ1ZSxcbiAgICAgICAgLy8gYXR0cmlidXRlT2xkVmFsdWU6IHRydWUsXG4gICAgICAgIGNoaWxkTGlzdDogdHJ1ZSwgLy8gVGhpcyBpcyBhIG11c3QgaGF2ZSBmb3IgdGhlIG9ic2VydmVyIHdpdGggc3VidHJlZVxuICAgICAgICBzdWJ0cmVlOiB0cnVlIC8vIFNldCB0byB0cnVlIGlmIGNoYW5nZXMgbXVzdCBhbHNvIGJlIG9ic2VydmVkIGluIGRlc2NlbmRhbnRzLlxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBzY3JlZW5TaXplQ2hlY2soKSB7XG4gICAgICAgIGNvbnN0IGJyZWFrcG9pbnRzTWFwID0gYnJlYWtwb2ludHMucmVkdWNlKChtYXAsIGJyZWFrcG9pbnQpID0+IHtcbiAgICAgICAgICAgIG1hcFticmVha3BvaW50LmZvcl0gPSBicmVha3BvaW50O1xuICAgICAgICAgICAgcmV0dXJuIG1hcDtcbiAgICAgICAgfSwge30pO1xuICAgICAgICBjb25zdCB7IG1vYmlsZSwgdGFibGV0LCBkZXNrdG9wIH0gPSBicmVha3BvaW50c01hcDtcbiAgICAgICAgY29uc3Qgd2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcblxuICAgICAgICBpZiAobW9iaWxlICE9PSB1bmRlZmluZWQgJiYgd2lkdGggPD0gbW9iaWxlLnZhbHVlKSB7XG4gICAgICAgICAgICBzZXRTY3JlZW5Nb2RlKFwibW9iaWxlXCIpO1xuICAgICAgICAgICAgc2V0TWF4Q29sdW1ucyhtb2JpbGUuY29sdW1ucyk7XG4gICAgICAgIH0gZWxzZSBpZiAodGFibGV0ICE9PSB1bmRlZmluZWQgJiYgd2lkdGggPD0gdGFibGV0LnZhbHVlKSB7XG4gICAgICAgICAgICBzZXRTY3JlZW5Nb2RlKFwidGFibGV0XCIpO1xuICAgICAgICAgICAgc2V0TWF4Q29sdW1ucyh0YWJsZXQuY29sdW1ucyk7XG4gICAgICAgIH0gZWxzZSBpZiAoZGVza3RvcCAhPT0gdW5kZWZpbmVkICYmIHdpZHRoIDw9IGRlc2t0b3AudmFsdWUpIHtcbiAgICAgICAgICAgIHNldFNjcmVlbk1vZGUoXCJkZXNrdG9wXCIpO1xuICAgICAgICAgICAgc2V0TWF4Q29sdW1ucyhkZXNrdG9wLmNvbHVtbnMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2V0U2NyZWVuTW9kZShcImxhcmdlLWRlc2t0b3BcIik7XG4gICAgICAgICAgICBzZXRNYXhDb2x1bW5zKDEwMCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZXRHcmlkQ29sdW1ucygpIHtcbiAgICAgICAgY29uc3QgY29sdW1uQXJyYXkgPSB0ZW1wbGF0ZUNvbHVtbnMucmVwbGFjZShcImdyaWQtdGVtcGxhdGUtY29sdW1uczogXCIsIFwiXCIpLnNwbGl0KC8gKD8hW14oKV0qXFwpKS8pO1xuICAgICAgICBjb25zdCBtYXhDb2x1bW5BcnJheSA9IGNvbHVtbkFycmF5LnNsaWNlKFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIGNvbHVtbkFycmF5Lmxlbmd0aCAtIChjb2x1bW5BcnJheS5sZW5ndGggLSBtYXhDb2x1bW5zKSArIChrZWVwTGFzdEJvb2xlYW4gPyAtMSA6IDApXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKGtlZXBMYXN0Qm9vbGVhbikge1xuICAgICAgICAgICAgbWF4Q29sdW1uQXJyYXkucHVzaChcImZpdC1jb250ZW50KDEwMCUpXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKFJlbmRlckNoZXZyb24gPT09IFwicmlnaHRcIikge1xuICAgICAgICAgICAgbWF4Q29sdW1uQXJyYXkucHVzaChcImZpdC1jb250ZW50KDEwMCUpXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWF4Q29sdW1uQXJyYXkudW5zaGlmdChcImZpdC1jb250ZW50KDEwMCUpXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZvcmNlQXV0b0ZpbGwpIHtcbiAgICAgICAgICAgIG1heENvbHVtbkFycmF5LnNwbGljZSgyLCAxLCBcIjFmclwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRhYmxlQ29udGVudC5zZXRBdHRyaWJ1dGUoXCJzdHlsZVwiLCBgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiAke21heENvbHVtbkFycmF5LmpvaW4oXCIgXCIpLnJlcGxhY2UoXCI7XCIsIFwiXCIpfTtgKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0b2dnbGVUckNvbGxhcHNlKGV2ZW50LCBjaGV2cm9uQnRuKSB7XG4gICAgICAgIGNvbnN0IG5vdENvbGxhcHNlZCA9IFtcbiAgICAgICAgICAgIC4uLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudHItcmVzcC1jb2xsYXBzaWJsZTpub3QoLnRyLXJlc3AtY29sbGFwc2libGUtLWNvbGxhcHNlZClcIilcbiAgICAgICAgXTtcbiAgICAgICAgaWYgKG5vdENvbGxhcHNlZC5sZW5ndGgpIHtcbiAgICAgICAgICAgIG5vdENvbGxhcHNlZC5mb3JFYWNoKGNoZXZyb25Sb3cgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvd0J0biA9IGNoZXZyb25Sb3cucGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmJ0bi10ZC1yZXNwLWNvbGxhcHNlXCIpO1xuICAgICAgICAgICAgICAgIGlmIChyb3dCdG4gIT09IGNoZXZyb25CdG4pIHtcbiAgICAgICAgICAgICAgICAgICAgY2hldnJvblJvdy5jbGFzc0xpc3QudG9nZ2xlKFwidHItcmVzcC1jb2xsYXBzaWJsZS0tY29sbGFwc2VkXCIpO1xuICAgICAgICAgICAgICAgICAgICBjaGV2cm9uUm93LnBhcmVudEVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIC5xdWVyeVNlbGVjdG9yKFwiLmJ0bi10ZC1yZXNwLWNvbGxhcHNlXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2xhc3NMaXN0LnRvZ2dsZShcImJ0bi10ZC1yZXNwLWNvbGxhcHNlLS1hY3RpdmVcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBjaGV2cm9uQnRuLmNsYXNzTGlzdC50b2dnbGUoXCJidG4tdGQtcmVzcC1jb2xsYXBzZS0tYWN0aXZlXCIpO1xuICAgICAgICBldmVudC50YXJnZXRcbiAgICAgICAgICAgIC5jbG9zZXN0KFwiLnRyXCIpXG4gICAgICAgICAgICAucXVlcnlTZWxlY3RvcihcIi50ci1yZXNwLWNvbGxhcHNpYmxlXCIpXG4gICAgICAgICAgICAuY2xhc3NMaXN0LnRvZ2dsZShcInRyLXJlc3AtY29sbGFwc2libGUtLWNvbGxhcHNlZFwiKTtcbiAgICB9XG5cbiAgICAvLyBDaGVjayB0aGUgY29sdW1uIHRvIGluc2VydCB0aGUgY2hldnJvblxuICAgIGZ1bmN0aW9uIHJlbmRlckNoZXZyb24ocm93KSB7XG4gICAgICAgIC8vIENoZWNrIGZpcnN0IFRIIGlmIHRoZXJlIGlzIG5vIGNoZXZyb24gcHJlc2VudFxuICAgICAgICBpZiAoIXJvdy5xdWVyeVNlbGVjdG9yKFwiLnRoLmNoZXZyb24tdGhcIikpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdFRIID1cbiAgICAgICAgICAgICAgICBSZW5kZXJDaGV2cm9uID09PSBcImxlZnRcIlxuICAgICAgICAgICAgICAgICAgICA/IHJvdy5xdWVyeVNlbGVjdG9yKFwiLnRoXCIpXG4gICAgICAgICAgICAgICAgICAgIDogcm93LnF1ZXJ5U2VsZWN0b3IoYC50aDpudGgtY2hpbGQoJHttYXhDb2x1bW5zICsgMX0pYCk7XG4gICAgICAgICAgICBjb25zdCBleHRyYVRIID0gYDxkaXYgY2xhc3M9XCJ0aCBjaGV2cm9uLXRoXCIgcm9sZT1cImNvbHVtbmhlYWRlclwiPjxkaXYgY2xhc3M9XCJjb2x1bW4tY29udGFpbmVyXCI+Jm5ic3A7PC9kaXY+PC9kaXY+YDtcbiAgICAgICAgICAgIGlmIChzZWxlY3RUSCAmJiBzZWxlY3RUSC5xdWVyeVNlbGVjdG9yKFwiLnRkLWN1c3RvbS1jb250ZW50XCIpICYmIFJlbmRlckNoZXZyb24gPT09IFwibGVmdFwiKSB7XG4gICAgICAgICAgICAgICAgc2VsZWN0VEguaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYWZ0ZXJlbmRcIiwgZXh0cmFUSCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHNlbGVjdFRIKSB7XG4gICAgICAgICAgICAgICAgc2VsZWN0VEguaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYmVmb3JlYmVnaW5cIiwgZXh0cmFUSCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDaGVjayBmaXJzdCBURCBpZiB0aGVyZSBpcyBubyBjaGV2cm9uIHByZXNlbnRcbiAgICAgICAgaWYgKCFyb3cucXVlcnlTZWxlY3RvcihcIi50ZC5jaGV2cm9uLXRkXCIpKSB7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3RURCA9XG4gICAgICAgICAgICAgICAgUmVuZGVyQ2hldnJvbiA9PT0gXCJsZWZ0XCJcbiAgICAgICAgICAgICAgICAgICAgPyByb3cucXVlcnlTZWxlY3RvcihcIi50ZFwiKVxuICAgICAgICAgICAgICAgICAgICA6IHJvdy5xdWVyeVNlbGVjdG9yKGAudGQ6bnRoLWNoaWxkKCR7bWF4Q29sdW1ucyArIDF9KWApO1xuICAgICAgICAgICAgY29uc3QgYm9yZGVyQ2xhc3MgPSByb3cucXVlcnlTZWxlY3RvcihcIi50ZC1ib3JkZXJzXCIpID8gXCJ0ZC1ib3JkZXJzIFwiIDogXCJcIjtcbiAgICAgICAgICAgIGNvbnN0IGNsaWNrYWJsZUNsYXNzID0gcm93LnF1ZXJ5U2VsZWN0b3IoXCIudGQuY2xpY2thYmxlXCIpID8gXCJjbGlja2FibGVcIiA6IFwiXCI7XG4gICAgICAgICAgICBjb25zdCBleHRyYVREID0gYDxkaXYgY2xhc3M9XCJ0ZCBjaGV2cm9uLXRkIGJ0bi10ZC1yZXNwLWNvbGxhcHNlICR7Ym9yZGVyQ2xhc3N9JHtjbGlja2FibGVDbGFzc31cIiByb2xlPVwiZ3JpZGNlbGxcIj48ZGl2IGNsYXNzPVwidGQtY3VzdG9tLWNvbnRlbnRcIj48c3ZnIGhlaWdodD1cIjE2XCIgd2lkdGg9XCIxNlwiIHZpZXdCb3g9XCIwIDAgMTYgMTZcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgZmlsbD1cImN1cnJlbnRDb2xvclwiPjxwYXRoIGQ9XCJNOC4wMDAwNCAxMS4xMzY5QzguMjEwMzMgMTEuMTM2OSA4LjM4NzQxIDExLjA1MzkgOC41NDc4OSAxMC44OTM0TDEyLjQ5MzUgNi44NTM2OEMxMi42MjA4IDYuNzIwODcgMTIuNjg3MiA2LjU2NTkyIDEyLjY4NzIgNi4zNzc3N0MxMi42ODcyIDUuOTkwNCAxMi4zODI5IDUuNjg2MDQgMTIuMDA2NiA1LjY4NjA0QzExLjgyMzkgNS42ODYwNCAxMS42NDY5IDUuNzYzNTEgMTEuNTA4NSA1LjkwMTg2TDguMDA1NTcgOS41MDQzOUw0LjQ5MTU4IDUuOTAxODZDNC4zNTg3NiA1Ljc2OTA0IDQuMTg3MjIgNS42ODYwNCAzLjk5MzUzIDUuNjg2MDRDMy42MTcyMyA1LjY4NjA0IDMuMzEyODcgNS45OTA0IDMuMzEyODcgNi4zNzc3N0MzLjMxMjg3IDYuNTYwMzggMy4zODQ4MSA2LjcyMDg3IDMuNTEyMDggNi44NTM2OEw3LjQ1NzcyIDEwLjg5MzRDNy42MjM3NCAxMS4wNTk0IDcuNzk1MjkgMTEuMTM2OSA4LjAwMDA0IDExLjEzNjlaXCIvPjwvc3ZnPjwvZGl2PjwvZGl2PmA7XG4gICAgICAgICAgICBpZiAoc2VsZWN0VEQgJiYgc2VsZWN0VEQucXVlcnlTZWxlY3RvcihcIi50ZC1jdXN0b20tY29udGVudFwiKSAmJiBSZW5kZXJDaGV2cm9uID09PSBcImxlZnRcIikge1xuICAgICAgICAgICAgICAgIHNlbGVjdFRELmluc2VydEFkamFjZW50SFRNTChcImFmdGVyZW5kXCIsIGV4dHJhVEQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChzZWxlY3RURCkge1xuICAgICAgICAgICAgICAgIHNlbGVjdFRELmluc2VydEFkamFjZW50SFRNTChcImJlZm9yZWJlZ2luXCIsIGV4dHJhVEQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVuZGVyQ29sbGFwc2libGVEaXYocm93KSB7XG4gICAgICAgIGNvbnN0IGNvbGxhcHNpYmxlRGl2ID0gYDxkaXYgY2xhc3M9XCJ0ci1yZXNwLWNvbGxhcHNpYmxlIHRyLXJlc3AtY29sbGFwc2libGUtLWNvbGxhcHNlZFwiPjwvZGl2PmA7XG4gICAgICAgIGlmICghcm93LnF1ZXJ5U2VsZWN0b3IoXCIudHItcmVzcC1jb2xsYXBzaWJsZVwiKSkge1xuICAgICAgICAgICAgcm93Lmluc2VydEFkamFjZW50SFRNTChcImJlZm9yZWVuZFwiLCBjb2xsYXBzaWJsZURpdik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtb3ZlQ29sdW1uc0luc2lkZUNvbGxhcHNpYmxlRGl2KHJvdykge1xuICAgICAgICBjb25zdCBlbmRJbmRleCA9IGtlZXBMYXN0Qm9vbGVhbiA/IC0xIDogMDtcbiAgICAgICAgY29uc3QgVEhzID0gWy4uLnJvdy5xdWVyeVNlbGVjdG9yQWxsKFwiLnRoXCIpXTtcblxuICAgICAgICBpZiAoVEhzLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3Qgc3RhcnRJbmRleCA9IFRIcy5sZW5ndGggLSAoVEhzLmxlbmd0aCAtIG1heENvbHVtbnMpICsgKGtlZXBMYXN0Qm9vbGVhbiA/IC0xIDogMCk7XG5cbiAgICAgICAgICAgIGlmIChrZWVwTGFzdEJvb2xlYW4pIHtcbiAgICAgICAgICAgICAgICBUSHMuc2xpY2Uoc3RhcnRJbmRleCwgZW5kSW5kZXgpLmZvckVhY2goVEggPT4ge1xuICAgICAgICAgICAgICAgICAgICBUSC5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBUSHMuc2xpY2Uoc3RhcnRJbmRleCkuZm9yRWFjaChUSCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIFRILmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBURHMgPSBbLi4ucm93LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGRcIildO1xuICAgICAgICBpZiAoVERzLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3Qgc3RhcnRJbmRleCA9IFREcy5sZW5ndGggLSAoVERzLmxlbmd0aCAtIG1heENvbHVtbnMpICsgKGtlZXBMYXN0Qm9vbGVhbiA/IC0xIDogMCk7XG5cbiAgICAgICAgICAgIGlmIChrZWVwTGFzdEJvb2xlYW4pIHtcbiAgICAgICAgICAgICAgICBURHMuc2xpY2Uoc3RhcnRJbmRleCwgZW5kSW5kZXgpLmZvckVhY2goKFRELCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBURC5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBoZWFkZXJzID0gW1xuICAgICAgICAgICAgICAgICAgICAgICAgLi4uZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcud2lkZ2V0LWRhdGFncmlkIC50cltyb2xlPVwicm93XCJdOmZpcnN0LWNoaWxkIC50aC5oaWRkZW4nXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbGxhcHNpYmxlID0gcm93LnF1ZXJ5U2VsZWN0b3IoXCIudHItcmVzcC1jb2xsYXBzaWJsZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sbGFwc2libGVDb250ZW50ID0gYDxkaXYgY2xhc3M9XCJ0ci1yZXNwLWNvbGxhcHNpYmxlX19pdGVtXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzcz1cInRkLXRleHQgdGV4dC1ib2xkIG5vbWFyZ2luXCI+JHtoZWFkZXJzW2luZGV4XT8ucXVlcnlTZWxlY3RvcihcInNwYW5cIikuaW5uZXJIVE1MfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRkLXRleHRcIj4ke1RELnF1ZXJ5U2VsZWN0b3IoXCJzcGFuXCIpPy5pbm5lckhUTUx9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+YDtcbiAgICAgICAgICAgICAgICAgICAgY29sbGFwc2libGUuaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYmVmb3JlZW5kXCIsIGNvbGxhcHNpYmxlQ29udGVudCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIFREcy5zbGljZShzdGFydEluZGV4KS5mb3JFYWNoKChURCwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgVEQuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaGVhZGVycyA9IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLmRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnLndpZGdldC1kYXRhZ3JpZCAudHJbcm9sZT1cInJvd1wiXTpmaXJzdC1jaGlsZCAudGguaGlkZGVuJ1xuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb2xsYXBzaWJsZSA9IHJvdy5xdWVyeVNlbGVjdG9yKFwiLnRyLXJlc3AtY29sbGFwc2libGVcIik7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbGxhcHNpYmxlQ29udGVudCA9IGA8ZGl2IGNsYXNzPVwidHItcmVzcC1jb2xsYXBzaWJsZV9faXRlbVwiPlxuICAgICAgICAgICAgICAgICAgICA8cCBjbGFzcz1cInRkLXRleHQgdGV4dC1ib2xkIG5vbWFyZ2luXCI+JHtoZWFkZXJzW2luZGV4XT8ucXVlcnlTZWxlY3RvcihcInNwYW5cIikuaW5uZXJIVE1MfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidGQtdGV4dFwiPiR7VEQucXVlcnlTZWxlY3RvcihcInNwYW5cIik/LmlubmVySFRNTH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PmA7XG4gICAgICAgICAgICAgICAgICAgIGNvbGxhcHNpYmxlLmluc2VydEFkamFjZW50SFRNTChcImJlZm9yZWVuZFwiLCBjb2xsYXBzaWJsZUNvbnRlbnQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVuZGVyRWxlbWVudHMoKSB7XG4gICAgICAgIC8vIFByb2Nlc3MgZWFjaCByb3dcbiAgICAgICAgZGF0YWdyaWRSb3dzUmVmLmN1cnJlbnQuZm9yRWFjaChyb3cgPT4ge1xuICAgICAgICAgICAgcmVuZGVyQ29sbGFwc2libGVEaXYocm93KTtcbiAgICAgICAgICAgIG1vdmVDb2x1bW5zSW5zaWRlQ29sbGFwc2libGVEaXYocm93KTtcbiAgICAgICAgICAgIHJlbmRlckNoZXZyb24ocm93KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgY2hldnJvbkJ0bnMgPSBbLi4uZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmJ0bi10ZC1yZXNwLWNvbGxhcHNlXCIpXTtcbiAgICAgICAgY2hldnJvbkJ0bnMuZm9yRWFjaChjaGV2cm9uQnRuID0+XG4gICAgICAgICAgICBjaGV2cm9uQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBldmVudCA9PiB0b2dnbGVUckNvbGxhcHNlKGV2ZW50LCBjaGV2cm9uQnRuKSlcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZXNldENvbGxhcHNpYmxlcygpIHtcbiAgICAgICAgY29uc3QgYWxsQ29sbGFwc2libGVzID0gWy4uLmRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQucXVlcnlTZWxlY3RvckFsbChcIi50ci1yZXNwLWNvbGxhcHNpYmxlXCIpXTtcbiAgICAgICAgYWxsQ29sbGFwc2libGVzLmZvckVhY2goY29sbGFwc2libGUgPT4gY29sbGFwc2libGUucmVtb3ZlKCkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlc2V0SGlkZGVuQ29sdW1ucygpIHtcbiAgICAgICAgY29uc3QgaGlkZGVuQ29sdW1ucyA9IFsuLi5kYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGguaGlkZGVuLCAudGQuaGlkZGVuXCIpXTtcbiAgICAgICAgaGlkZGVuQ29sdW1ucy5mb3JFYWNoKGhpZGRlbkNvbHVtbiA9PiBoaWRkZW5Db2x1bW4uY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVzZXRDaGV2cm9ucygpIHtcbiAgICAgICAgY29uc3Qgcm93cyA9IFsuLi5kYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy50cltyb2xlPVwicm93XCJdJyldO1xuICAgICAgICByb3dzLmZvckVhY2gocm93ID0+IHtcbiAgICAgICAgICAgIHJvdy5xdWVyeVNlbGVjdG9yKFwiLnRoLmNoZXZyb24tdGhcIik/LnJlbW92ZSgpO1xuICAgICAgICAgICAgcm93LnF1ZXJ5U2VsZWN0b3IoXCIudGQuY2hldnJvbi10ZFwiKT8ucmVtb3ZlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9uU29ydCgpIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICByZXNldENvbGxhcHNpYmxlcygpO1xuICAgICAgICAgICAgcmVzZXRIaWRkZW5Db2x1bW5zKCk7XG4gICAgICAgICAgICByZXNldENoZXZyb25zKCk7XG4gICAgICAgICAgICByZW5kZXJFbGVtZW50cygpO1xuICAgICAgICB9LCAxMDApO1xuICAgIH1cblxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGlmIChjYW5SZW5kZXIgJiYgc2NyZWVuTW9kZSkge1xuICAgICAgICAgICAgY29uc3QgaGVhZGVycyA9IFsuLi5kYXRhZ3JpZFJvd3NSZWYuY3VycmVudFswXS5xdWVyeVNlbGVjdG9yQWxsKFwiLnRoXCIpXTtcblxuICAgICAgICAgICAgLy8gRm9yIGRlc2t0b3AgbGVhdmUgLyByZXN0b3JlIGRlZmF1bHQuIEZvciBvdGhlciBzaXR1YXRpb25zIHVwZGF0ZSB0byBtb2JpbGUgLyB0YWJsZXQgY29sdW1uc1xuICAgICAgICAgICAgaWYgKHNjcmVlbk1vZGUgPT09IFwibGFyZ2UtZGVza3RvcFwiKSB7XG4gICAgICAgICAgICAgICAgdGFibGVDb250ZW50LnNldEF0dHJpYnV0ZShcInN0eWxlXCIsIHRlbXBsYXRlQ29sdW1ucyk7XG4gICAgICAgICAgICAgICAgcmVzZXRDb2xsYXBzaWJsZXMoKTtcbiAgICAgICAgICAgICAgICByZXNldEhpZGRlbkNvbHVtbnMoKTtcbiAgICAgICAgICAgICAgICByZXNldENoZXZyb25zKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNldEdyaWRDb2x1bW5zKCk7XG4gICAgICAgICAgICAgICAgcmVzZXRDb2xsYXBzaWJsZXMoKTtcbiAgICAgICAgICAgICAgICByZXNldEhpZGRlbkNvbHVtbnMoKTtcbiAgICAgICAgICAgICAgICByZXNldENoZXZyb25zKCk7XG4gICAgICAgICAgICAgICAgcmVuZGVyRWxlbWVudHMoKTtcbiAgICAgICAgICAgICAgICBoZWFkZXJzLmZvckVhY2goaGVhZGVyID0+IGhlYWRlci5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgb25Tb3J0KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEZXRlY3QgYSBjaGFuZ2UgaW4gRGF0YSBncmlkIDIgYWZ0ZXIgdGhlIGluaXRpYWwgcmVuZGVyaW5nIG9mIGV2ZXJ5dGhpbmdcbiAgICAgICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigoKSA9PiB7XG4gICAgICAgICAgICBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICBpZiAoZGF0YWdyaWRSb3dzUmVmLmN1cnJlbnQgIT09IGRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQucXVlcnlTZWxlY3RvckFsbChcIi50cltyb2xlPXJvd11cIikpIHtcbiAgICAgICAgICAgICAgICBkYXRhZ3JpZFJvd3NSZWYuY3VycmVudCA9IFsuLi5kYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudHJbcm9sZT1yb3ddXCIpXTtcbiAgICAgICAgICAgICAgICBpZiAoc2NyZWVuTW9kZSAhPT0gXCJsYXJnZS1kZXNrdG9wXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzZXRDb2xsYXBzaWJsZXMoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzZXRIaWRkZW5Db2x1bW5zKCk7XG4gICAgICAgICAgICAgICAgICAgIHJlc2V0Q2hldnJvbnMoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyRWxlbWVudHMoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG9ic2VydmVyLm9ic2VydmUoZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudCwgY29uZmlnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGRhdGFncmlkV2lkZ2V0UmVmICYmIGRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIG9ic2VydmVyLm9ic2VydmUoZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudCwgY29uZmlnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoKSA9PiBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgfSk7XG5cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBpZiAoRFMgJiYgRFMuc3RhdHVzID09PSBcImF2YWlsYWJsZVwiICYmIHdpZGdldExvYWRlZCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgaWYgKGRhdGFncmlkUm93c1JlZi5jdXJyZW50ICE9PSBkYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudHJbcm9sZT1yb3ddXCIpKSB7XG4gICAgICAgICAgICAgICAgZGF0YWdyaWRSb3dzUmVmLmN1cnJlbnQgPSBbLi4uZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnRyW3JvbGU9cm93XVwiKV07XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzY3JlZW5Nb2RlICE9PSBcImxhcmdlLWRlc2t0b3BcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzZXRDb2xsYXBzaWJsZXMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc2V0SGlkZGVuQ29sdW1ucygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzZXRDaGV2cm9ucygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyRWxlbWVudHMoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIDIwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgaWYgKGRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICBzZXRUYWJsZUNvbnRlbnQoZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudC5xdWVyeVNlbGVjdG9yKFwiLndpZGdldC1kYXRhZ3JpZCAud2lkZ2V0LWRhdGFncmlkLWdyaWQtYm9keVwiKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQsIGNvbmZpZyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChkYXRhZ3JpZFdpZGdldFJlZiAmJiBkYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQsIGNvbmZpZyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKCkgPT4gb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgIH0sIFtdKTtcblxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGlmICh0YWJsZUNvbnRlbnQpIHtcbiAgICAgICAgICAgIHNldFRlbXBsYXRlQ29sdW1ucyh0YWJsZUNvbnRlbnQuZ2V0QXR0cmlidXRlKFwic3R5bGVcIikpO1xuICAgICAgICAgICAgc2NyZWVuU2l6ZUNoZWNrKCk7XG4gICAgICAgICAgICBzZXRDYW5SZW5kZXIodHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9LCBbdGFibGVDb250ZW50XSk7XG5cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBpZiAoY2FuUmVuZGVyKSB7XG4gICAgICAgICAgICBzY3JlZW5TaXplQ2hlY2soKTtcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHNjcmVlblNpemVDaGVjayk7XG4gICAgICAgICAgICBzZXRXaWRnZXRMb2FkZWQodHJ1ZSk7XG4gICAgICAgICAgICByZXR1cm4gKCkgPT4gd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgc2NyZWVuU2l6ZUNoZWNrKTtcbiAgICAgICAgfVxuICAgIH0sIFtjYW5SZW5kZXJdKTtcblxuICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgcmVzcG9uc2l2ZS1kYXRhZ3JpZCAke3N0eWxlfWB9IHJlZj17ZGF0YWdyaWRXaWRnZXRSZWZ9PlxuICAgICAgICAgICAge2RhdGFHcmlkV2lkZ2V0fVxuICAgICAgICA8L2Rpdj5cbiAgICApO1xufVxuIl0sIm5hbWVzIjpbIlJlc3BvbnNpdmVEYXRhZ3JpZFR3byIsImJyZWFrcG9pbnRzIiwiZGF0YUdyaWRXaWRnZXQiLCJEUyIsImZvcmNlQXV0b0ZpbGwiLCJrZWVwTGFzdEJvb2xlYW4iLCJSZW5kZXJDaGV2cm9uIiwicmVzdCIsInN0eWxlIiwiY2xhc3MiLCJkYXRhZ3JpZFdpZGdldFJlZiIsInVzZVJlZiIsImRhdGFncmlkUm93c1JlZiIsInRhYmxlQ29udGVudCIsInNldFRhYmxlQ29udGVudCIsInVzZVN0YXRlIiwiY2FuUmVuZGVyIiwic2V0Q2FuUmVuZGVyIiwidGVtcGxhdGVDb2x1bW5zIiwic2V0VGVtcGxhdGVDb2x1bW5zIiwic2NyZWVuTW9kZSIsInNldFNjcmVlbk1vZGUiLCJtYXhDb2x1bW5zIiwic2V0TWF4Q29sdW1ucyIsIndpZGdldExvYWRlZCIsInNldFdpZGdldExvYWRlZCIsImNvbmZpZyIsImNoaWxkTGlzdCIsInN1YnRyZWUiLCJzY3JlZW5TaXplQ2hlY2siLCJicmVha3BvaW50c01hcCIsInJlZHVjZSIsIm1hcCIsImJyZWFrcG9pbnQiLCJmb3IiLCJtb2JpbGUiLCJ0YWJsZXQiLCJkZXNrdG9wIiwid2lkdGgiLCJ3aW5kb3ciLCJpbm5lcldpZHRoIiwidW5kZWZpbmVkIiwidmFsdWUiLCJjb2x1bW5zIiwic2V0R3JpZENvbHVtbnMiLCJjb2x1bW5BcnJheSIsInJlcGxhY2UiLCJzcGxpdCIsIm1heENvbHVtbkFycmF5Iiwic2xpY2UiLCJsZW5ndGgiLCJwdXNoIiwidW5zaGlmdCIsInNwbGljZSIsInNldEF0dHJpYnV0ZSIsImpvaW4iLCJ0b2dnbGVUckNvbGxhcHNlIiwiZXZlbnQiLCJjaGV2cm9uQnRuIiwibm90Q29sbGFwc2VkIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yQWxsIiwiZm9yRWFjaCIsImNoZXZyb25Sb3ciLCJyb3dCdG4iLCJwYXJlbnRFbGVtZW50IiwicXVlcnlTZWxlY3RvciIsImNsYXNzTGlzdCIsInRvZ2dsZSIsInRhcmdldCIsImNsb3Nlc3QiLCJyZW5kZXJDaGV2cm9uIiwicm93Iiwic2VsZWN0VEgiLCJleHRyYVRIIiwiaW5zZXJ0QWRqYWNlbnRIVE1MIiwic2VsZWN0VEQiLCJib3JkZXJDbGFzcyIsImNsaWNrYWJsZUNsYXNzIiwiZXh0cmFURCIsInJlbmRlckNvbGxhcHNpYmxlRGl2IiwiY29sbGFwc2libGVEaXYiLCJtb3ZlQ29sdW1uc0luc2lkZUNvbGxhcHNpYmxlRGl2IiwiZW5kSW5kZXgiLCJUSHMiLCJzdGFydEluZGV4IiwiVEgiLCJhZGQiLCJURHMiLCJURCIsImluZGV4IiwiaGVhZGVycyIsImN1cnJlbnQiLCJjb2xsYXBzaWJsZSIsImNvbGxhcHNpYmxlQ29udGVudCIsImlubmVySFRNTCIsInJlbmRlckVsZW1lbnRzIiwiY2hldnJvbkJ0bnMiLCJhZGRFdmVudExpc3RlbmVyIiwicmVzZXRDb2xsYXBzaWJsZXMiLCJhbGxDb2xsYXBzaWJsZXMiLCJyZW1vdmUiLCJyZXNldEhpZGRlbkNvbHVtbnMiLCJoaWRkZW5Db2x1bW5zIiwiaGlkZGVuQ29sdW1uIiwicmVzZXRDaGV2cm9ucyIsInJvd3MiLCJvblNvcnQiLCJzZXRUaW1lb3V0IiwidXNlRWZmZWN0IiwiaGVhZGVyIiwib2JzZXJ2ZXIiLCJNdXRhdGlvbk9ic2VydmVyIiwiZGlzY29ubmVjdCIsIm9ic2VydmUiLCJzdGF0dXMiLCJnZXRBdHRyaWJ1dGUiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiY3JlYXRlRWxlbWVudCIsImNsYXNzTmFtZSIsInJlZiJdLCJtYXBwaW5ncyI6Ijs7QUFHTyxTQUFTQSxxQkFBcUJBLENBQUM7RUFDbENDLFdBQVc7RUFDWEMsY0FBYztFQUNkQyxFQUFFO0VBQ0ZDLGFBQWE7RUFDYkMsZUFBZTtFQUNmQyxhQUFhO0VBQ2IsR0FBR0MsSUFBQUE7QUFDUCxDQUFDLEVBQUU7QUFDQyxFQUFBLE1BQU1DLEtBQUssR0FBR0QsSUFBSSxDQUFDRSxLQUFLLElBQUksRUFBRSxDQUFBO0FBQzlCLEVBQUEsTUFBTUMsaUJBQWlCLEdBQUdDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUN0QyxFQUFBLE1BQU1DLGVBQWUsR0FBR0QsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0VBQ2xDLE1BQU0sQ0FBQ0UsWUFBWSxFQUFFQyxlQUFlLENBQUMsR0FBR0MsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFBO0VBQ3RELE1BQU0sQ0FBQ0MsU0FBUyxFQUFFQyxZQUFZLENBQUMsR0FBR0YsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFBO0VBQ2pELE1BQU0sQ0FBQ0csZUFBZSxFQUFFQyxrQkFBa0IsQ0FBQyxHQUFHSixRQUFRLENBQUMsSUFBSSxDQUFDLENBQUE7RUFDNUQsTUFBTSxDQUFDSyxVQUFVLEVBQUVDLGFBQWEsQ0FBQyxHQUFHTixRQUFRLENBQUMsSUFBSSxDQUFDLENBQUE7RUFDbEQsTUFBTSxDQUFDTyxVQUFVLEVBQUVDLGFBQWEsQ0FBQyxHQUFHUixRQUFRLENBQUMsR0FBRyxDQUFDLENBQUE7RUFDakQsTUFBTSxDQUFDUyxZQUFZLEVBQUVDLGVBQWUsQ0FBQyxHQUFHVixRQUFRLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDdkQsRUFBQSxNQUFNVyxNQUFNLEdBQUc7QUFDWDtBQUNBO0FBQ0FDLElBQUFBLFNBQVMsRUFBRSxJQUFJO0FBQUU7SUFDakJDLE9BQU8sRUFBRSxJQUFJO0dBQ2hCLENBQUE7RUFFRCxTQUFTQyxlQUFlQSxHQUFHO0lBQ3ZCLE1BQU1DLGNBQWMsR0FBRzdCLFdBQVcsQ0FBQzhCLE1BQU0sQ0FBQyxDQUFDQyxHQUFHLEVBQUVDLFVBQVUsS0FBSztBQUMzREQsTUFBQUEsR0FBRyxDQUFDQyxVQUFVLENBQUNDLEdBQUcsQ0FBQyxHQUFHRCxVQUFVLENBQUE7QUFDaEMsTUFBQSxPQUFPRCxHQUFHLENBQUE7S0FDYixFQUFFLEVBQUUsQ0FBQyxDQUFBO0lBQ04sTUFBTTtNQUFFRyxNQUFNO01BQUVDLE1BQU07QUFBRUMsTUFBQUEsT0FBQUE7QUFBUSxLQUFDLEdBQUdQLGNBQWMsQ0FBQTtBQUNsRCxJQUFBLE1BQU1RLEtBQUssR0FBR0MsTUFBTSxDQUFDQyxVQUFVLENBQUE7SUFFL0IsSUFBSUwsTUFBTSxLQUFLTSxTQUFTLElBQUlILEtBQUssSUFBSUgsTUFBTSxDQUFDTyxLQUFLLEVBQUU7TUFDL0NyQixhQUFhLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDdkJFLE1BQUFBLGFBQWEsQ0FBQ1ksTUFBTSxDQUFDUSxPQUFPLENBQUMsQ0FBQTtLQUNoQyxNQUFNLElBQUlQLE1BQU0sS0FBS0ssU0FBUyxJQUFJSCxLQUFLLElBQUlGLE1BQU0sQ0FBQ00sS0FBSyxFQUFFO01BQ3REckIsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQ3ZCRSxNQUFBQSxhQUFhLENBQUNhLE1BQU0sQ0FBQ08sT0FBTyxDQUFDLENBQUE7S0FDaEMsTUFBTSxJQUFJTixPQUFPLEtBQUtJLFNBQVMsSUFBSUgsS0FBSyxJQUFJRCxPQUFPLENBQUNLLEtBQUssRUFBRTtNQUN4RHJCLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQTtBQUN4QkUsTUFBQUEsYUFBYSxDQUFDYyxPQUFPLENBQUNNLE9BQU8sQ0FBQyxDQUFBO0FBQ2xDLEtBQUMsTUFBTTtNQUNIdEIsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFBO01BQzlCRSxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDdEIsS0FBQTtBQUNKLEdBQUE7RUFFQSxTQUFTcUIsY0FBY0EsR0FBRztBQUN0QixJQUFBLE1BQU1DLFdBQVcsR0FBRzNCLGVBQWUsQ0FBQzRCLE9BQU8sQ0FBQyx5QkFBeUIsRUFBRSxFQUFFLENBQUMsQ0FBQ0MsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFBO0lBQ2pHLE1BQU1DLGNBQWMsR0FBR0gsV0FBVyxDQUFDSSxLQUFLLENBQ3BDLENBQUMsRUFDREosV0FBVyxDQUFDSyxNQUFNLElBQUlMLFdBQVcsQ0FBQ0ssTUFBTSxHQUFHNUIsVUFBVSxDQUFDLElBQUlqQixlQUFlLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUN0RixDQUFDLENBQUE7QUFFRCxJQUFBLElBQUlBLGVBQWUsRUFBRTtBQUNqQjJDLE1BQUFBLGNBQWMsQ0FBQ0csSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUE7QUFDNUMsS0FBQTtJQUVBLElBQUk3QyxhQUFhLEtBQUssT0FBTyxFQUFFO0FBQzNCMEMsTUFBQUEsY0FBYyxDQUFDRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtBQUM1QyxLQUFDLE1BQU07QUFDSEgsTUFBQUEsY0FBYyxDQUFDSSxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtBQUMvQyxLQUFBO0FBRUEsSUFBQSxJQUFJaEQsYUFBYSxFQUFFO01BQ2Y0QyxjQUFjLENBQUNLLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFBO0FBQ3RDLEtBQUE7SUFFQXhDLFlBQVksQ0FBQ3lDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBMEJOLHVCQUFBQSxFQUFBQSxjQUFjLENBQUNPLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQ1QsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDOUcsR0FBQTtBQUVBLEVBQUEsU0FBU1UsZ0JBQWdCQSxDQUFDQyxLQUFLLEVBQUVDLFVBQVUsRUFBRTtJQUN6QyxNQUFNQyxZQUFZLEdBQUcsQ0FDakIsR0FBR0MsUUFBUSxDQUFDQyxnQkFBZ0IsQ0FBQywyREFBMkQsQ0FBQyxDQUM1RixDQUFBO0lBQ0QsSUFBSUYsWUFBWSxDQUFDVCxNQUFNLEVBQUU7QUFDckJTLE1BQUFBLFlBQVksQ0FBQ0csT0FBTyxDQUFDQyxVQUFVLElBQUk7UUFDL0IsTUFBTUMsTUFBTSxHQUFHRCxVQUFVLENBQUNFLGFBQWEsQ0FBQ0MsYUFBYSxDQUFDLHVCQUF1QixDQUFDLENBQUE7UUFDOUUsSUFBSUYsTUFBTSxLQUFLTixVQUFVLEVBQUU7QUFDdkJLLFVBQUFBLFVBQVUsQ0FBQ0ksU0FBUyxDQUFDQyxNQUFNLENBQUMsZ0NBQWdDLENBQUMsQ0FBQTtBQUM3REwsVUFBQUEsVUFBVSxDQUFDRSxhQUFhLENBQ25CQyxhQUFhLENBQUMsdUJBQXVCLENBQUMsQ0FDdENDLFNBQVMsQ0FBQ0MsTUFBTSxDQUFDLDhCQUE4QixDQUFDLENBQUE7QUFDekQsU0FBQTtBQUNKLE9BQUMsQ0FBQyxDQUFBO0FBQ04sS0FBQTtBQUVBVixJQUFBQSxVQUFVLENBQUNTLFNBQVMsQ0FBQ0MsTUFBTSxDQUFDLDhCQUE4QixDQUFDLENBQUE7QUFDM0RYLElBQUFBLEtBQUssQ0FBQ1ksTUFBTSxDQUNQQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQ2RKLGFBQWEsQ0FBQyxzQkFBc0IsQ0FBQyxDQUNyQ0MsU0FBUyxDQUFDQyxNQUFNLENBQUMsZ0NBQWdDLENBQUMsQ0FBQTtBQUMzRCxHQUFBOztBQUVBO0VBQ0EsU0FBU0csYUFBYUEsQ0FBQ0MsR0FBRyxFQUFFO0FBQ3hCO0FBQ0EsSUFBQSxJQUFJLENBQUNBLEdBQUcsQ0FBQ04sYUFBYSxDQUFDLGdCQUFnQixDQUFDLEVBQUU7TUFDdEMsTUFBTU8sUUFBUSxHQUNWbkUsYUFBYSxLQUFLLE1BQU0sR0FDbEJrRSxHQUFHLENBQUNOLGFBQWEsQ0FBQyxLQUFLLENBQUMsR0FDeEJNLEdBQUcsQ0FBQ04sYUFBYSxDQUFDLGlCQUFpQjVDLFVBQVUsR0FBRyxDQUFDLENBQUEsQ0FBQSxDQUFHLENBQUMsQ0FBQTtNQUMvRCxNQUFNb0QsT0FBTyxHQUFHLENBQWlHLCtGQUFBLENBQUEsQ0FBQTtBQUNqSCxNQUFBLElBQUlELFFBQVEsSUFBSUEsUUFBUSxDQUFDUCxhQUFhLENBQUMsb0JBQW9CLENBQUMsSUFBSTVELGFBQWEsS0FBSyxNQUFNLEVBQUU7QUFDdEZtRSxRQUFBQSxRQUFRLENBQUNFLGtCQUFrQixDQUFDLFVBQVUsRUFBRUQsT0FBTyxDQUFDLENBQUE7T0FDbkQsTUFBTSxJQUFJRCxRQUFRLEVBQUU7QUFDakJBLFFBQUFBLFFBQVEsQ0FBQ0Usa0JBQWtCLENBQUMsYUFBYSxFQUFFRCxPQUFPLENBQUMsQ0FBQTtBQUN2RCxPQUFBO0FBQ0osS0FBQTs7QUFFQTtBQUNBLElBQUEsSUFBSSxDQUFDRixHQUFHLENBQUNOLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO01BQ3RDLE1BQU1VLFFBQVEsR0FDVnRFLGFBQWEsS0FBSyxNQUFNLEdBQ2xCa0UsR0FBRyxDQUFDTixhQUFhLENBQUMsS0FBSyxDQUFDLEdBQ3hCTSxHQUFHLENBQUNOLGFBQWEsQ0FBQyxpQkFBaUI1QyxVQUFVLEdBQUcsQ0FBQyxDQUFBLENBQUEsQ0FBRyxDQUFDLENBQUE7TUFDL0QsTUFBTXVELFdBQVcsR0FBR0wsR0FBRyxDQUFDTixhQUFhLENBQUMsYUFBYSxDQUFDLEdBQUcsYUFBYSxHQUFHLEVBQUUsQ0FBQTtNQUN6RSxNQUFNWSxjQUFjLEdBQUdOLEdBQUcsQ0FBQ04sYUFBYSxDQUFDLGVBQWUsQ0FBQyxHQUFHLFdBQVcsR0FBRyxFQUFFLENBQUE7QUFDNUUsTUFBQSxNQUFNYSxPQUFPLEdBQUcsQ0FBQSwrQ0FBQSxFQUFrREYsV0FBVyxDQUFBLEVBQUdDLGNBQWMsQ0FBdW9CLHFvQkFBQSxDQUFBLENBQUE7QUFDcnVCLE1BQUEsSUFBSUYsUUFBUSxJQUFJQSxRQUFRLENBQUNWLGFBQWEsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJNUQsYUFBYSxLQUFLLE1BQU0sRUFBRTtBQUN0RnNFLFFBQUFBLFFBQVEsQ0FBQ0Qsa0JBQWtCLENBQUMsVUFBVSxFQUFFSSxPQUFPLENBQUMsQ0FBQTtPQUNuRCxNQUFNLElBQUlILFFBQVEsRUFBRTtBQUNqQkEsUUFBQUEsUUFBUSxDQUFDRCxrQkFBa0IsQ0FBQyxhQUFhLEVBQUVJLE9BQU8sQ0FBQyxDQUFBO0FBQ3ZELE9BQUE7QUFDSixLQUFBO0FBQ0osR0FBQTtFQUVBLFNBQVNDLG9CQUFvQkEsQ0FBQ1IsR0FBRyxFQUFFO0lBQy9CLE1BQU1TLGNBQWMsR0FBRyxDQUF3RSxzRUFBQSxDQUFBLENBQUE7QUFDL0YsSUFBQSxJQUFJLENBQUNULEdBQUcsQ0FBQ04sYUFBYSxDQUFDLHNCQUFzQixDQUFDLEVBQUU7QUFDNUNNLE1BQUFBLEdBQUcsQ0FBQ0csa0JBQWtCLENBQUMsV0FBVyxFQUFFTSxjQUFjLENBQUMsQ0FBQTtBQUN2RCxLQUFBO0FBQ0osR0FBQTtFQUVBLFNBQVNDLCtCQUErQkEsQ0FBQ1YsR0FBRyxFQUFFO0FBQzFDLElBQUEsTUFBTVcsUUFBUSxHQUFHOUUsZUFBZSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUN6QyxNQUFNK0UsR0FBRyxHQUFHLENBQUMsR0FBR1osR0FBRyxDQUFDWCxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0lBRTVDLElBQUl1QixHQUFHLENBQUNsQyxNQUFNLEVBQUU7QUFDWixNQUFBLE1BQU1tQyxVQUFVLEdBQUdELEdBQUcsQ0FBQ2xDLE1BQU0sSUFBSWtDLEdBQUcsQ0FBQ2xDLE1BQU0sR0FBRzVCLFVBQVUsQ0FBQyxJQUFJakIsZUFBZSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO0FBRXRGLE1BQUEsSUFBSUEsZUFBZSxFQUFFO1FBQ2pCK0UsR0FBRyxDQUFDbkMsS0FBSyxDQUFDb0MsVUFBVSxFQUFFRixRQUFRLENBQUMsQ0FBQ3JCLE9BQU8sQ0FBQ3dCLEVBQUUsSUFBSTtBQUMxQ0EsVUFBQUEsRUFBRSxDQUFDbkIsU0FBUyxDQUFDb0IsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQzlCLFNBQUMsQ0FBQyxDQUFBO0FBQ04sT0FBQyxNQUFNO1FBQ0hILEdBQUcsQ0FBQ25DLEtBQUssQ0FBQ29DLFVBQVUsQ0FBQyxDQUFDdkIsT0FBTyxDQUFDd0IsRUFBRSxJQUFJO0FBQ2hDQSxVQUFBQSxFQUFFLENBQUNuQixTQUFTLENBQUNvQixHQUFHLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDOUIsU0FBQyxDQUFDLENBQUE7QUFDTixPQUFBO0FBQ0osS0FBQTtJQUVBLE1BQU1DLEdBQUcsR0FBRyxDQUFDLEdBQUdoQixHQUFHLENBQUNYLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7SUFDNUMsSUFBSTJCLEdBQUcsQ0FBQ3RDLE1BQU0sRUFBRTtBQUNaLE1BQUEsTUFBTW1DLFVBQVUsR0FBR0csR0FBRyxDQUFDdEMsTUFBTSxJQUFJc0MsR0FBRyxDQUFDdEMsTUFBTSxHQUFHNUIsVUFBVSxDQUFDLElBQUlqQixlQUFlLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7QUFFdEYsTUFBQSxJQUFJQSxlQUFlLEVBQUU7QUFDakJtRixRQUFBQSxHQUFHLENBQUN2QyxLQUFLLENBQUNvQyxVQUFVLEVBQUVGLFFBQVEsQ0FBQyxDQUFDckIsT0FBTyxDQUFDLENBQUMyQixFQUFFLEVBQUVDLEtBQUssS0FBSztBQUNuREQsVUFBQUEsRUFBRSxDQUFDdEIsU0FBUyxDQUFDb0IsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQzFCLFVBQUEsTUFBTUksT0FBTyxHQUFHLENBQ1osR0FBR2pGLGlCQUFpQixDQUFDa0YsT0FBTyxDQUFDL0IsZ0JBQWdCLENBQ3pDLHlEQUNKLENBQUMsQ0FDSixDQUFBO0FBQ0QsVUFBQSxNQUFNZ0MsV0FBVyxHQUFHckIsR0FBRyxDQUFDTixhQUFhLENBQUMsc0JBQXNCLENBQUMsQ0FBQTtBQUM3RCxVQUFBLE1BQU00QixrQkFBa0IsR0FBRyxDQUFBO0FBQy9DLDhEQUFnRUgsRUFBQUEsT0FBTyxDQUFDRCxLQUFLLENBQUMsRUFBRXhCLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQzZCLFNBQVMsQ0FBQTtBQUMvRyxrREFBQSxFQUFvRE4sRUFBRSxDQUFDdkIsYUFBYSxDQUFDLE1BQU0sQ0FBQyxFQUFFNkIsU0FBUyxDQUFBO0FBQ3ZGLDhCQUErQixDQUFBLENBQUE7QUFDWEYsVUFBQUEsV0FBVyxDQUFDbEIsa0JBQWtCLENBQUMsV0FBVyxFQUFFbUIsa0JBQWtCLENBQUMsQ0FBQTtBQUNuRSxTQUFDLENBQUMsQ0FBQTtBQUNOLE9BQUMsTUFBTTtBQUNITixRQUFBQSxHQUFHLENBQUN2QyxLQUFLLENBQUNvQyxVQUFVLENBQUMsQ0FBQ3ZCLE9BQU8sQ0FBQyxDQUFDMkIsRUFBRSxFQUFFQyxLQUFLLEtBQUs7QUFDekNELFVBQUFBLEVBQUUsQ0FBQ3RCLFNBQVMsQ0FBQ29CLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUMxQixVQUFBLE1BQU1JLE9BQU8sR0FBRyxDQUNaLEdBQUdqRixpQkFBaUIsQ0FBQ2tGLE9BQU8sQ0FBQy9CLGdCQUFnQixDQUN6Qyx5REFDSixDQUFDLENBQ0osQ0FBQTtBQUNELFVBQUEsTUFBTWdDLFdBQVcsR0FBR3JCLEdBQUcsQ0FBQ04sYUFBYSxDQUFDLHNCQUFzQixDQUFDLENBQUE7QUFDN0QsVUFBQSxNQUFNNEIsa0JBQWtCLEdBQUcsQ0FBQTtBQUMvQywwREFBNERILEVBQUFBLE9BQU8sQ0FBQ0QsS0FBSyxDQUFDLEVBQUV4QixhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM2QixTQUFTLENBQUE7QUFDM0csOENBQUEsRUFBZ0ROLEVBQUUsQ0FBQ3ZCLGFBQWEsQ0FBQyxNQUFNLENBQUMsRUFBRTZCLFNBQVMsQ0FBQTtBQUNuRiwwQkFBMkIsQ0FBQSxDQUFBO0FBQ1BGLFVBQUFBLFdBQVcsQ0FBQ2xCLGtCQUFrQixDQUFDLFdBQVcsRUFBRW1CLGtCQUFrQixDQUFDLENBQUE7QUFDbkUsU0FBQyxDQUFDLENBQUE7QUFDTixPQUFBO0FBQ0osS0FBQTtBQUNKLEdBQUE7RUFFQSxTQUFTRSxjQUFjQSxHQUFHO0FBQ3RCO0FBQ0FwRixJQUFBQSxlQUFlLENBQUNnRixPQUFPLENBQUM5QixPQUFPLENBQUNVLEdBQUcsSUFBSTtNQUNuQ1Esb0JBQW9CLENBQUNSLEdBQUcsQ0FBQyxDQUFBO01BQ3pCVSwrQkFBK0IsQ0FBQ1YsR0FBRyxDQUFDLENBQUE7TUFDcENELGFBQWEsQ0FBQ0MsR0FBRyxDQUFDLENBQUE7QUFDdEIsS0FBQyxDQUFDLENBQUE7QUFFRixJQUFBLE1BQU15QixXQUFXLEdBQUcsQ0FBQyxHQUFHdkYsaUJBQWlCLENBQUNrRixPQUFPLENBQUMvQixnQkFBZ0IsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUE7SUFDNUZvQyxXQUFXLENBQUNuQyxPQUFPLENBQUNKLFVBQVUsSUFDMUJBLFVBQVUsQ0FBQ3dDLGdCQUFnQixDQUFDLE9BQU8sRUFBRXpDLEtBQUssSUFBSUQsZ0JBQWdCLENBQUNDLEtBQUssRUFBRUMsVUFBVSxDQUFDLENBQ3JGLENBQUMsQ0FBQTtBQUNMLEdBQUE7RUFFQSxTQUFTeUMsaUJBQWlCQSxHQUFHO0FBQ3pCLElBQUEsTUFBTUMsZUFBZSxHQUFHLENBQUMsR0FBRzFGLGlCQUFpQixDQUFDa0YsT0FBTyxDQUFDL0IsZ0JBQWdCLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFBO0lBQy9GdUMsZUFBZSxDQUFDdEMsT0FBTyxDQUFDK0IsV0FBVyxJQUFJQSxXQUFXLENBQUNRLE1BQU0sRUFBRSxDQUFDLENBQUE7QUFDaEUsR0FBQTtFQUVBLFNBQVNDLGtCQUFrQkEsR0FBRztBQUMxQixJQUFBLE1BQU1DLGFBQWEsR0FBRyxDQUFDLEdBQUc3RixpQkFBaUIsQ0FBQ2tGLE9BQU8sQ0FBQy9CLGdCQUFnQixDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQTtBQUMvRjBDLElBQUFBLGFBQWEsQ0FBQ3pDLE9BQU8sQ0FBQzBDLFlBQVksSUFBSUEsWUFBWSxDQUFDckMsU0FBUyxDQUFDa0MsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUE7QUFDbEYsR0FBQTtFQUVBLFNBQVNJLGFBQWFBLEdBQUc7QUFDckIsSUFBQSxNQUFNQyxJQUFJLEdBQUcsQ0FBQyxHQUFHaEcsaUJBQWlCLENBQUNrRixPQUFPLENBQUMvQixnQkFBZ0IsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUE7QUFDL0U2QyxJQUFBQSxJQUFJLENBQUM1QyxPQUFPLENBQUNVLEdBQUcsSUFBSTtNQUNoQkEsR0FBRyxDQUFDTixhQUFhLENBQUMsZ0JBQWdCLENBQUMsRUFBRW1DLE1BQU0sRUFBRSxDQUFBO01BQzdDN0IsR0FBRyxDQUFDTixhQUFhLENBQUMsZ0JBQWdCLENBQUMsRUFBRW1DLE1BQU0sRUFBRSxDQUFBO0FBQ2pELEtBQUMsQ0FBQyxDQUFBO0FBQ04sR0FBQTtFQUVBLFNBQVNNLE1BQU1BLEdBQUc7QUFDZEMsSUFBQUEsVUFBVSxDQUFDLE1BQU07QUFDYlQsTUFBQUEsaUJBQWlCLEVBQUUsQ0FBQTtBQUNuQkcsTUFBQUEsa0JBQWtCLEVBQUUsQ0FBQTtBQUNwQkcsTUFBQUEsYUFBYSxFQUFFLENBQUE7QUFDZlQsTUFBQUEsY0FBYyxFQUFFLENBQUE7S0FDbkIsRUFBRSxHQUFHLENBQUMsQ0FBQTtBQUNYLEdBQUE7QUFFQWEsRUFBQUEsU0FBUyxDQUFDLE1BQU07SUFDWixJQUFJN0YsU0FBUyxJQUFJSSxVQUFVLEVBQUU7QUFDekIsTUFBQSxNQUFNdUUsT0FBTyxHQUFHLENBQUMsR0FBRy9FLGVBQWUsQ0FBQ2dGLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQy9CLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7O0FBRXZFO01BQ0EsSUFBSXpDLFVBQVUsS0FBSyxlQUFlLEVBQUU7QUFDaENQLFFBQUFBLFlBQVksQ0FBQ3lDLFlBQVksQ0FBQyxPQUFPLEVBQUVwQyxlQUFlLENBQUMsQ0FBQTtBQUNuRGlGLFFBQUFBLGlCQUFpQixFQUFFLENBQUE7QUFDbkJHLFFBQUFBLGtCQUFrQixFQUFFLENBQUE7QUFDcEJHLFFBQUFBLGFBQWEsRUFBRSxDQUFBO0FBQ25CLE9BQUMsTUFBTTtBQUNIN0QsUUFBQUEsY0FBYyxFQUFFLENBQUE7QUFDaEJ1RCxRQUFBQSxpQkFBaUIsRUFBRSxDQUFBO0FBQ25CRyxRQUFBQSxrQkFBa0IsRUFBRSxDQUFBO0FBQ3BCRyxRQUFBQSxhQUFhLEVBQUUsQ0FBQTtBQUNmVCxRQUFBQSxjQUFjLEVBQUUsQ0FBQTtBQUNoQkwsUUFBQUEsT0FBTyxDQUFDN0IsT0FBTyxDQUFDZ0QsTUFBTSxJQUFJQSxNQUFNLENBQUNaLGdCQUFnQixDQUFDLE9BQU8sRUFBRVMsTUFBTSxDQUFDLENBQUMsQ0FBQTtBQUN2RSxPQUFBO0FBQ0osS0FBQTs7QUFFQTtBQUNBLElBQUEsTUFBTUksUUFBUSxHQUFHLElBQUlDLGdCQUFnQixDQUFDLE1BQU07TUFDeENELFFBQVEsQ0FBQ0UsVUFBVSxFQUFFLENBQUE7QUFDckIsTUFBQSxJQUFJckcsZUFBZSxDQUFDZ0YsT0FBTyxLQUFLbEYsaUJBQWlCLENBQUNrRixPQUFPLENBQUMvQixnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsRUFBRTtBQUN6RmpELFFBQUFBLGVBQWUsQ0FBQ2dGLE9BQU8sR0FBRyxDQUFDLEdBQUdsRixpQkFBaUIsQ0FBQ2tGLE9BQU8sQ0FBQy9CLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUE7UUFDMUYsSUFBSXpDLFVBQVUsS0FBSyxlQUFlLEVBQUU7QUFDaEMrRSxVQUFBQSxpQkFBaUIsRUFBRSxDQUFBO0FBQ25CRyxVQUFBQSxrQkFBa0IsRUFBRSxDQUFBO0FBQ3BCRyxVQUFBQSxhQUFhLEVBQUUsQ0FBQTtBQUNmVCxVQUFBQSxjQUFjLEVBQUUsQ0FBQTtBQUNwQixTQUFBO0FBQ0osT0FBQTtNQUVBZSxRQUFRLENBQUNHLE9BQU8sQ0FBQ3hHLGlCQUFpQixDQUFDa0YsT0FBTyxFQUFFbEUsTUFBTSxDQUFDLENBQUE7QUFDdkQsS0FBQyxDQUFDLENBQUE7QUFFRixJQUFBLElBQUloQixpQkFBaUIsSUFBSUEsaUJBQWlCLENBQUNrRixPQUFPLEVBQUU7TUFDaERtQixRQUFRLENBQUNHLE9BQU8sQ0FBQ3hHLGlCQUFpQixDQUFDa0YsT0FBTyxFQUFFbEUsTUFBTSxDQUFDLENBQUE7QUFDdkQsS0FBQTtBQUVBLElBQUEsT0FBTyxNQUFNcUYsUUFBUSxDQUFDRSxVQUFVLEVBQUUsQ0FBQTtBQUN0QyxHQUFDLENBQUMsQ0FBQTtBQUVGSixFQUFBQSxTQUFTLENBQUMsTUFBTTtJQUNaLElBQUkxRyxFQUFFLElBQUlBLEVBQUUsQ0FBQ2dILE1BQU0sS0FBSyxXQUFXLElBQUkzRixZQUFZLEtBQUssSUFBSSxFQUFFO0FBQzFELE1BQUEsSUFBSVosZUFBZSxDQUFDZ0YsT0FBTyxLQUFLbEYsaUJBQWlCLENBQUNrRixPQUFPLENBQUMvQixnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsRUFBRTtBQUN6RmpELFFBQUFBLGVBQWUsQ0FBQ2dGLE9BQU8sR0FBRyxDQUFDLEdBQUdsRixpQkFBaUIsQ0FBQ2tGLE9BQU8sQ0FBQy9CLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUE7QUFDMUYrQyxRQUFBQSxVQUFVLENBQUMsTUFBTTtVQUNiLElBQUl4RixVQUFVLEtBQUssZUFBZSxFQUFFO0FBQ2hDK0UsWUFBQUEsaUJBQWlCLEVBQUUsQ0FBQTtBQUNuQkcsWUFBQUEsa0JBQWtCLEVBQUUsQ0FBQTtBQUNwQkcsWUFBQUEsYUFBYSxFQUFFLENBQUE7QUFDZlQsWUFBQUEsY0FBYyxFQUFFLENBQUE7QUFDcEIsV0FBQTtTQUNILEVBQUUsR0FBRyxDQUFDLENBQUE7QUFDWCxPQUFBO0FBQ0osS0FBQTtBQUNKLEdBQUMsQ0FBQyxDQUFBO0FBRUZhLEVBQUFBLFNBQVMsQ0FBQyxNQUFNO0FBQ1osSUFBQSxNQUFNRSxRQUFRLEdBQUcsSUFBSUMsZ0JBQWdCLENBQUMsTUFBTTtNQUN4Q0QsUUFBUSxDQUFDRSxVQUFVLEVBQUUsQ0FBQTtNQUNyQixJQUFJdkcsaUJBQWlCLENBQUNrRixPQUFPLEVBQUU7UUFDM0I5RSxlQUFlLENBQUNKLGlCQUFpQixDQUFDa0YsT0FBTyxDQUFDMUIsYUFBYSxDQUFDLDZDQUE2QyxDQUFDLENBQUMsQ0FBQTtBQUMzRyxPQUFBO01BQ0E2QyxRQUFRLENBQUNHLE9BQU8sQ0FBQ3hHLGlCQUFpQixDQUFDa0YsT0FBTyxFQUFFbEUsTUFBTSxDQUFDLENBQUE7QUFDdkQsS0FBQyxDQUFDLENBQUE7QUFFRixJQUFBLElBQUloQixpQkFBaUIsSUFBSUEsaUJBQWlCLENBQUNrRixPQUFPLEVBQUU7TUFDaERtQixRQUFRLENBQUNHLE9BQU8sQ0FBQ3hHLGlCQUFpQixDQUFDa0YsT0FBTyxFQUFFbEUsTUFBTSxDQUFDLENBQUE7QUFDdkQsS0FBQTtBQUVBLElBQUEsT0FBTyxNQUFNcUYsUUFBUSxDQUFDRSxVQUFVLEVBQUUsQ0FBQTtHQUNyQyxFQUFFLEVBQUUsQ0FBQyxDQUFBO0FBRU5KLEVBQUFBLFNBQVMsQ0FBQyxNQUFNO0FBQ1osSUFBQSxJQUFJaEcsWUFBWSxFQUFFO0FBQ2RNLE1BQUFBLGtCQUFrQixDQUFDTixZQUFZLENBQUN1RyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQTtBQUN0RHZGLE1BQUFBLGVBQWUsRUFBRSxDQUFBO01BQ2pCWixZQUFZLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDdEIsS0FBQTtBQUNKLEdBQUMsRUFBRSxDQUFDSixZQUFZLENBQUMsQ0FBQyxDQUFBO0FBRWxCZ0csRUFBQUEsU0FBUyxDQUFDLE1BQU07QUFDWixJQUFBLElBQUk3RixTQUFTLEVBQUU7QUFDWGEsTUFBQUEsZUFBZSxFQUFFLENBQUE7QUFDakJVLE1BQUFBLE1BQU0sQ0FBQzJELGdCQUFnQixDQUFDLFFBQVEsRUFBRXJFLGVBQWUsQ0FBQyxDQUFBO01BQ2xESixlQUFlLENBQUMsSUFBSSxDQUFDLENBQUE7TUFDckIsT0FBTyxNQUFNYyxNQUFNLENBQUM4RSxtQkFBbUIsQ0FBQyxRQUFRLEVBQUV4RixlQUFlLENBQUMsQ0FBQTtBQUN0RSxLQUFBO0FBQ0osR0FBQyxFQUFFLENBQUNiLFNBQVMsQ0FBQyxDQUFDLENBQUE7QUFFZixFQUFBLE9BQ0lzRyxhQUFBLENBQUEsS0FBQSxFQUFBO0lBQUtDLFNBQVMsRUFBRSxDQUF1Qi9HLG9CQUFBQSxFQUFBQSxLQUFLLENBQUcsQ0FBQTtBQUFDZ0gsSUFBQUEsR0FBRyxFQUFFOUcsaUJBQUFBO0FBQWtCLEdBQUEsRUFDbEVSLGNBQ0EsQ0FBQyxDQUFBO0FBRWQ7Ozs7In0=
