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
    if (!templateColumns) {
      return;
    }
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
    if (tableContent) {
      tableContent.setAttribute("style", `grid-template-columns: ${maxColumnArray.join(" ").replace(";", "")};`);
    }
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
    const allCollapsibles = [...(datagridWidgetRef.current?.querySelectorAll(".tr-resp-collapsible") || [])];
    allCollapsibles.forEach(collapsible => collapsible.remove());
  }
  function resetHiddenColumns() {
    const hiddenColumns = [...datagridWidgetRef.current?.querySelectorAll(".th.hidden, .td.hidden")];
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
    if (canRender && screenMode && datagridRowsRef.current.length) {
      const headers = [...datagridRowsRef.current[0].querySelectorAll(".th")];

      // For desktop leave / restore default. For other situations update to mobile / tablet columns
      if (screenMode === "large-desktop") {
        if (tableContent) {
          tableContent?.setAttribute("style", templateColumns);
          resetCollapsibles();
          resetHiddenColumns();
          resetChevrons();
        }
      } else {
        if (tableContent) {
          setGridColumns();
          resetCollapsibles();
          resetHiddenColumns();
          resetChevrons();
          renderElements();
          headers.forEach(header => header.addEventListener("click", onSort));
        }
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
        setTableContent(datagridWidgetRef.current.querySelector(".widget-datagrid .widget-datagrid-grid.table"));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzcG9uc2l2ZURhdGFncmlkVHdvLm1qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL1Jlc3BvbnNpdmVEYXRhZ3JpZFR3by5qc3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFwiLi91aS9SZXNwb25zaXZlRGF0YWdyaWRUd28uY3NzXCI7XG5pbXBvcnQgeyBjcmVhdGVFbGVtZW50LCB1c2VFZmZlY3QsIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIFJlc3BvbnNpdmVEYXRhZ3JpZFR3byh7XG4gICAgYnJlYWtwb2ludHMsXG4gICAgZGF0YUdyaWRXaWRnZXQsXG4gICAgRFMsXG4gICAgZm9yY2VBdXRvRmlsbCxcbiAgICBrZWVwTGFzdEJvb2xlYW4sXG4gICAgUmVuZGVyQ2hldnJvbixcbiAgICAuLi5yZXN0XG59KSB7XG4gICAgY29uc3Qgc3R5bGUgPSByZXN0LmNsYXNzIHx8IFwiXCI7XG4gICAgY29uc3QgZGF0YWdyaWRXaWRnZXRSZWYgPSB1c2VSZWYobnVsbCk7XG4gICAgY29uc3QgZGF0YWdyaWRSb3dzUmVmID0gdXNlUmVmKFtdKTtcbiAgICBjb25zdCBbdGFibGVDb250ZW50LCBzZXRUYWJsZUNvbnRlbnRdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW2NhblJlbmRlciwgc2V0Q2FuUmVuZGVyXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCBbdGVtcGxhdGVDb2x1bW5zLCBzZXRUZW1wbGF0ZUNvbHVtbnNdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW3NjcmVlbk1vZGUsIHNldFNjcmVlbk1vZGVdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW21heENvbHVtbnMsIHNldE1heENvbHVtbnNdID0gdXNlU3RhdGUoMTAwKTtcbiAgICBjb25zdCBbd2lkZ2V0TG9hZGVkLCBzZXRXaWRnZXRMb2FkZWRdID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IGNvbmZpZyA9IHtcbiAgICAgICAgLy8gYXR0cmlidXRlczogdHJ1ZSxcbiAgICAgICAgLy8gYXR0cmlidXRlT2xkVmFsdWU6IHRydWUsXG4gICAgICAgIGNoaWxkTGlzdDogdHJ1ZSwgLy8gVGhpcyBpcyBhIG11c3QgaGF2ZSBmb3IgdGhlIG9ic2VydmVyIHdpdGggc3VidHJlZVxuICAgICAgICBzdWJ0cmVlOiB0cnVlIC8vIFNldCB0byB0cnVlIGlmIGNoYW5nZXMgbXVzdCBhbHNvIGJlIG9ic2VydmVkIGluIGRlc2NlbmRhbnRzLlxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBzY3JlZW5TaXplQ2hlY2soKSB7XG4gICAgICAgIGNvbnN0IGJyZWFrcG9pbnRzTWFwID0gYnJlYWtwb2ludHMucmVkdWNlKChtYXAsIGJyZWFrcG9pbnQpID0+IHtcbiAgICAgICAgICAgIG1hcFticmVha3BvaW50LmZvcl0gPSBicmVha3BvaW50O1xuICAgICAgICAgICAgcmV0dXJuIG1hcDtcbiAgICAgICAgfSwge30pO1xuICAgICAgICBjb25zdCB7IG1vYmlsZSwgdGFibGV0LCBkZXNrdG9wIH0gPSBicmVha3BvaW50c01hcDtcbiAgICAgICAgY29uc3Qgd2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcblxuICAgICAgICBpZiAobW9iaWxlICE9PSB1bmRlZmluZWQgJiYgd2lkdGggPD0gbW9iaWxlLnZhbHVlKSB7XG4gICAgICAgICAgICBzZXRTY3JlZW5Nb2RlKFwibW9iaWxlXCIpO1xuICAgICAgICAgICAgc2V0TWF4Q29sdW1ucyhtb2JpbGUuY29sdW1ucyk7XG4gICAgICAgIH0gZWxzZSBpZiAodGFibGV0ICE9PSB1bmRlZmluZWQgJiYgd2lkdGggPD0gdGFibGV0LnZhbHVlKSB7XG4gICAgICAgICAgICBzZXRTY3JlZW5Nb2RlKFwidGFibGV0XCIpO1xuICAgICAgICAgICAgc2V0TWF4Q29sdW1ucyh0YWJsZXQuY29sdW1ucyk7XG4gICAgICAgIH0gZWxzZSBpZiAoZGVza3RvcCAhPT0gdW5kZWZpbmVkICYmIHdpZHRoIDw9IGRlc2t0b3AudmFsdWUpIHtcbiAgICAgICAgICAgIHNldFNjcmVlbk1vZGUoXCJkZXNrdG9wXCIpO1xuICAgICAgICAgICAgc2V0TWF4Q29sdW1ucyhkZXNrdG9wLmNvbHVtbnMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2V0U2NyZWVuTW9kZShcImxhcmdlLWRlc2t0b3BcIik7XG4gICAgICAgICAgICBzZXRNYXhDb2x1bW5zKDEwMCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZXRHcmlkQ29sdW1ucygpIHtcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZUNvbHVtbnMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNvbHVtbkFycmF5ID0gdGVtcGxhdGVDb2x1bW5zLnJlcGxhY2UoXCJncmlkLXRlbXBsYXRlLWNvbHVtbnM6IFwiLCBcIlwiKS5zcGxpdCgvICg/IVteKCldKlxcKSkvKTtcbiAgICAgICAgY29uc3QgbWF4Q29sdW1uQXJyYXkgPSBjb2x1bW5BcnJheS5zbGljZShcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICBjb2x1bW5BcnJheS5sZW5ndGggLSAoY29sdW1uQXJyYXkubGVuZ3RoIC0gbWF4Q29sdW1ucykgKyAoa2VlcExhc3RCb29sZWFuID8gLTEgOiAwKVxuICAgICAgICApO1xuXG4gICAgICAgIGlmIChrZWVwTGFzdEJvb2xlYW4pIHtcbiAgICAgICAgICAgIG1heENvbHVtbkFycmF5LnB1c2goXCJmaXQtY29udGVudCgxMDAlKVwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChSZW5kZXJDaGV2cm9uID09PSBcInJpZ2h0XCIpIHtcbiAgICAgICAgICAgIG1heENvbHVtbkFycmF5LnB1c2goXCJmaXQtY29udGVudCgxMDAlKVwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1heENvbHVtbkFycmF5LnVuc2hpZnQoXCJmaXQtY29udGVudCgxMDAlKVwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChmb3JjZUF1dG9GaWxsKSB7XG4gICAgICAgICAgICBtYXhDb2x1bW5BcnJheS5zcGxpY2UoMiwgMSwgXCIxZnJcIik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGFibGVDb250ZW50KSB7XG4gICAgICAgICAgICB0YWJsZUNvbnRlbnQuc2V0QXR0cmlidXRlKFwic3R5bGVcIiwgYGdyaWQtdGVtcGxhdGUtY29sdW1uczogJHttYXhDb2x1bW5BcnJheS5qb2luKFwiIFwiKS5yZXBsYWNlKFwiO1wiLCBcIlwiKX07YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0b2dnbGVUckNvbGxhcHNlKGV2ZW50LCBjaGV2cm9uQnRuKSB7XG4gICAgICAgIGNvbnN0IG5vdENvbGxhcHNlZCA9IFtcbiAgICAgICAgICAgIC4uLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudHItcmVzcC1jb2xsYXBzaWJsZTpub3QoLnRyLXJlc3AtY29sbGFwc2libGUtLWNvbGxhcHNlZClcIilcbiAgICAgICAgXTtcbiAgICAgICAgaWYgKG5vdENvbGxhcHNlZC5sZW5ndGgpIHtcbiAgICAgICAgICAgIG5vdENvbGxhcHNlZC5mb3JFYWNoKGNoZXZyb25Sb3cgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvd0J0biA9IGNoZXZyb25Sb3cucGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmJ0bi10ZC1yZXNwLWNvbGxhcHNlXCIpO1xuICAgICAgICAgICAgICAgIGlmIChyb3dCdG4gIT09IGNoZXZyb25CdG4pIHtcbiAgICAgICAgICAgICAgICAgICAgY2hldnJvblJvdy5jbGFzc0xpc3QudG9nZ2xlKFwidHItcmVzcC1jb2xsYXBzaWJsZS0tY29sbGFwc2VkXCIpO1xuICAgICAgICAgICAgICAgICAgICBjaGV2cm9uUm93LnBhcmVudEVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIC5xdWVyeVNlbGVjdG9yKFwiLmJ0bi10ZC1yZXNwLWNvbGxhcHNlXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2xhc3NMaXN0LnRvZ2dsZShcImJ0bi10ZC1yZXNwLWNvbGxhcHNlLS1hY3RpdmVcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBjaGV2cm9uQnRuLmNsYXNzTGlzdC50b2dnbGUoXCJidG4tdGQtcmVzcC1jb2xsYXBzZS0tYWN0aXZlXCIpO1xuICAgICAgICBldmVudC50YXJnZXRcbiAgICAgICAgICAgIC5jbG9zZXN0KFwiLnRyXCIpXG4gICAgICAgICAgICAucXVlcnlTZWxlY3RvcihcIi50ci1yZXNwLWNvbGxhcHNpYmxlXCIpXG4gICAgICAgICAgICAuY2xhc3NMaXN0LnRvZ2dsZShcInRyLXJlc3AtY29sbGFwc2libGUtLWNvbGxhcHNlZFwiKTtcbiAgICB9XG5cbiAgICAvLyBDaGVjayB0aGUgY29sdW1uIHRvIGluc2VydCB0aGUgY2hldnJvblxuICAgIGZ1bmN0aW9uIHJlbmRlckNoZXZyb24ocm93KSB7XG4gICAgICAgIC8vIENoZWNrIGZpcnN0IFRIIGlmIHRoZXJlIGlzIG5vIGNoZXZyb24gcHJlc2VudFxuICAgICAgICBpZiAoIXJvdy5xdWVyeVNlbGVjdG9yKFwiLnRoLmNoZXZyb24tdGhcIikpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdFRIID1cbiAgICAgICAgICAgICAgICBSZW5kZXJDaGV2cm9uID09PSBcImxlZnRcIlxuICAgICAgICAgICAgICAgICAgICA/IHJvdy5xdWVyeVNlbGVjdG9yKFwiLnRoXCIpXG4gICAgICAgICAgICAgICAgICAgIDogcm93LnF1ZXJ5U2VsZWN0b3IoYC50aDpudGgtY2hpbGQoJHttYXhDb2x1bW5zICsgMX0pYCk7XG4gICAgICAgICAgICBjb25zdCBleHRyYVRIID0gYDxkaXYgY2xhc3M9XCJ0aCBjaGV2cm9uLXRoXCIgcm9sZT1cImNvbHVtbmhlYWRlclwiPjxkaXYgY2xhc3M9XCJjb2x1bW4tY29udGFpbmVyXCI+Jm5ic3A7PC9kaXY+PC9kaXY+YDtcbiAgICAgICAgICAgIGlmIChzZWxlY3RUSCAmJiBzZWxlY3RUSC5xdWVyeVNlbGVjdG9yKFwiLnRkLWN1c3RvbS1jb250ZW50XCIpICYmIFJlbmRlckNoZXZyb24gPT09IFwibGVmdFwiKSB7XG4gICAgICAgICAgICAgICAgc2VsZWN0VEguaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYWZ0ZXJlbmRcIiwgZXh0cmFUSCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHNlbGVjdFRIKSB7XG4gICAgICAgICAgICAgICAgc2VsZWN0VEguaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYmVmb3JlYmVnaW5cIiwgZXh0cmFUSCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDaGVjayBmaXJzdCBURCBpZiB0aGVyZSBpcyBubyBjaGV2cm9uIHByZXNlbnRcbiAgICAgICAgaWYgKCFyb3cucXVlcnlTZWxlY3RvcihcIi50ZC5jaGV2cm9uLXRkXCIpKSB7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3RURCA9XG4gICAgICAgICAgICAgICAgUmVuZGVyQ2hldnJvbiA9PT0gXCJsZWZ0XCJcbiAgICAgICAgICAgICAgICAgICAgPyByb3cucXVlcnlTZWxlY3RvcihcIi50ZFwiKVxuICAgICAgICAgICAgICAgICAgICA6IHJvdy5xdWVyeVNlbGVjdG9yKGAudGQ6bnRoLWNoaWxkKCR7bWF4Q29sdW1ucyArIDF9KWApO1xuICAgICAgICAgICAgY29uc3QgYm9yZGVyQ2xhc3MgPSByb3cucXVlcnlTZWxlY3RvcihcIi50ZC1ib3JkZXJzXCIpID8gXCJ0ZC1ib3JkZXJzIFwiIDogXCJcIjtcbiAgICAgICAgICAgIGNvbnN0IGNsaWNrYWJsZUNsYXNzID0gcm93LnF1ZXJ5U2VsZWN0b3IoXCIudGQuY2xpY2thYmxlXCIpID8gXCJjbGlja2FibGVcIiA6IFwiXCI7XG4gICAgICAgICAgICBjb25zdCBleHRyYVREID0gYDxkaXYgY2xhc3M9XCJ0ZCBjaGV2cm9uLXRkIGJ0bi10ZC1yZXNwLWNvbGxhcHNlICR7Ym9yZGVyQ2xhc3N9JHtjbGlja2FibGVDbGFzc31cIiByb2xlPVwiZ3JpZGNlbGxcIj48ZGl2IGNsYXNzPVwidGQtY3VzdG9tLWNvbnRlbnRcIj48c3ZnIGhlaWdodD1cIjE2XCIgd2lkdGg9XCIxNlwiIHZpZXdCb3g9XCIwIDAgMTYgMTZcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgZmlsbD1cImN1cnJlbnRDb2xvclwiPjxwYXRoIGQ9XCJNOC4wMDAwNCAxMS4xMzY5QzguMjEwMzMgMTEuMTM2OSA4LjM4NzQxIDExLjA1MzkgOC41NDc4OSAxMC44OTM0TDEyLjQ5MzUgNi44NTM2OEMxMi42MjA4IDYuNzIwODcgMTIuNjg3MiA2LjU2NTkyIDEyLjY4NzIgNi4zNzc3N0MxMi42ODcyIDUuOTkwNCAxMi4zODI5IDUuNjg2MDQgMTIuMDA2NiA1LjY4NjA0QzExLjgyMzkgNS42ODYwNCAxMS42NDY5IDUuNzYzNTEgMTEuNTA4NSA1LjkwMTg2TDguMDA1NTcgOS41MDQzOUw0LjQ5MTU4IDUuOTAxODZDNC4zNTg3NiA1Ljc2OTA0IDQuMTg3MjIgNS42ODYwNCAzLjk5MzUzIDUuNjg2MDRDMy42MTcyMyA1LjY4NjA0IDMuMzEyODcgNS45OTA0IDMuMzEyODcgNi4zNzc3N0MzLjMxMjg3IDYuNTYwMzggMy4zODQ4MSA2LjcyMDg3IDMuNTEyMDggNi44NTM2OEw3LjQ1NzcyIDEwLjg5MzRDNy42MjM3NCAxMS4wNTk0IDcuNzk1MjkgMTEuMTM2OSA4LjAwMDA0IDExLjEzNjlaXCIvPjwvc3ZnPjwvZGl2PjwvZGl2PmA7XG4gICAgICAgICAgICBpZiAoc2VsZWN0VEQgJiYgc2VsZWN0VEQucXVlcnlTZWxlY3RvcihcIi50ZC1jdXN0b20tY29udGVudFwiKSAmJiBSZW5kZXJDaGV2cm9uID09PSBcImxlZnRcIikge1xuICAgICAgICAgICAgICAgIHNlbGVjdFRELmluc2VydEFkamFjZW50SFRNTChcImFmdGVyZW5kXCIsIGV4dHJhVEQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChzZWxlY3RURCkge1xuICAgICAgICAgICAgICAgIHNlbGVjdFRELmluc2VydEFkamFjZW50SFRNTChcImJlZm9yZWJlZ2luXCIsIGV4dHJhVEQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVuZGVyQ29sbGFwc2libGVEaXYocm93KSB7XG4gICAgICAgIGNvbnN0IGNvbGxhcHNpYmxlRGl2ID0gYDxkaXYgY2xhc3M9XCJ0ci1yZXNwLWNvbGxhcHNpYmxlIHRyLXJlc3AtY29sbGFwc2libGUtLWNvbGxhcHNlZFwiPjwvZGl2PmA7XG4gICAgICAgIGlmICghcm93LnF1ZXJ5U2VsZWN0b3IoXCIudHItcmVzcC1jb2xsYXBzaWJsZVwiKSkge1xuICAgICAgICAgICAgcm93Lmluc2VydEFkamFjZW50SFRNTChcImJlZm9yZWVuZFwiLCBjb2xsYXBzaWJsZURpdik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtb3ZlQ29sdW1uc0luc2lkZUNvbGxhcHNpYmxlRGl2KHJvdykge1xuICAgICAgICBjb25zdCBlbmRJbmRleCA9IGtlZXBMYXN0Qm9vbGVhbiA/IC0xIDogMDtcbiAgICAgICAgY29uc3QgVEhzID0gWy4uLnJvdy5xdWVyeVNlbGVjdG9yQWxsKFwiLnRoXCIpXTtcblxuICAgICAgICBpZiAoVEhzLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3Qgc3RhcnRJbmRleCA9IFRIcy5sZW5ndGggLSAoVEhzLmxlbmd0aCAtIG1heENvbHVtbnMpICsgKGtlZXBMYXN0Qm9vbGVhbiA/IC0xIDogMCk7XG5cbiAgICAgICAgICAgIGlmIChrZWVwTGFzdEJvb2xlYW4pIHtcbiAgICAgICAgICAgICAgICBUSHMuc2xpY2Uoc3RhcnRJbmRleCwgZW5kSW5kZXgpLmZvckVhY2goVEggPT4ge1xuICAgICAgICAgICAgICAgICAgICBUSC5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBUSHMuc2xpY2Uoc3RhcnRJbmRleCkuZm9yRWFjaChUSCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIFRILmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBURHMgPSBbLi4ucm93LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGRcIildO1xuICAgICAgICBpZiAoVERzLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3Qgc3RhcnRJbmRleCA9IFREcy5sZW5ndGggLSAoVERzLmxlbmd0aCAtIG1heENvbHVtbnMpICsgKGtlZXBMYXN0Qm9vbGVhbiA/IC0xIDogMCk7XG5cbiAgICAgICAgICAgIGlmIChrZWVwTGFzdEJvb2xlYW4pIHtcbiAgICAgICAgICAgICAgICBURHMuc2xpY2Uoc3RhcnRJbmRleCwgZW5kSW5kZXgpLmZvckVhY2goKFRELCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBURC5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBoZWFkZXJzID0gW1xuICAgICAgICAgICAgICAgICAgICAgICAgLi4uZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcud2lkZ2V0LWRhdGFncmlkIC50cltyb2xlPVwicm93XCJdOmZpcnN0LWNoaWxkIC50aC5oaWRkZW4nXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbGxhcHNpYmxlID0gcm93LnF1ZXJ5U2VsZWN0b3IoXCIudHItcmVzcC1jb2xsYXBzaWJsZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sbGFwc2libGVDb250ZW50ID0gYDxkaXYgY2xhc3M9XCJ0ci1yZXNwLWNvbGxhcHNpYmxlX19pdGVtXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzcz1cInRkLXRleHQgdGV4dC1ib2xkIG5vbWFyZ2luXCI+JHtoZWFkZXJzW2luZGV4XT8ucXVlcnlTZWxlY3RvcihcInNwYW5cIikuaW5uZXJIVE1MfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRkLXRleHRcIj4ke1RELnF1ZXJ5U2VsZWN0b3IoXCJzcGFuXCIpPy5pbm5lckhUTUx9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+YDtcbiAgICAgICAgICAgICAgICAgICAgY29sbGFwc2libGUuaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYmVmb3JlZW5kXCIsIGNvbGxhcHNpYmxlQ29udGVudCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIFREcy5zbGljZShzdGFydEluZGV4KS5mb3JFYWNoKChURCwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgVEQuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaGVhZGVycyA9IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLmRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnLndpZGdldC1kYXRhZ3JpZCAudHJbcm9sZT1cInJvd1wiXTpmaXJzdC1jaGlsZCAudGguaGlkZGVuJ1xuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb2xsYXBzaWJsZSA9IHJvdy5xdWVyeVNlbGVjdG9yKFwiLnRyLXJlc3AtY29sbGFwc2libGVcIik7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbGxhcHNpYmxlQ29udGVudCA9IGA8ZGl2IGNsYXNzPVwidHItcmVzcC1jb2xsYXBzaWJsZV9faXRlbVwiPlxuICAgICAgICAgICAgICAgICAgICA8cCBjbGFzcz1cInRkLXRleHQgdGV4dC1ib2xkIG5vbWFyZ2luXCI+JHtoZWFkZXJzW2luZGV4XT8ucXVlcnlTZWxlY3RvcihcInNwYW5cIikuaW5uZXJIVE1MfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidGQtdGV4dFwiPiR7VEQucXVlcnlTZWxlY3RvcihcInNwYW5cIik/LmlubmVySFRNTH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PmA7XG4gICAgICAgICAgICAgICAgICAgIGNvbGxhcHNpYmxlLmluc2VydEFkamFjZW50SFRNTChcImJlZm9yZWVuZFwiLCBjb2xsYXBzaWJsZUNvbnRlbnQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVuZGVyRWxlbWVudHMoKSB7XG4gICAgICAgIC8vIFByb2Nlc3MgZWFjaCByb3dcbiAgICAgICAgZGF0YWdyaWRSb3dzUmVmLmN1cnJlbnQuZm9yRWFjaChyb3cgPT4ge1xuICAgICAgICAgICAgcmVuZGVyQ29sbGFwc2libGVEaXYocm93KTtcbiAgICAgICAgICAgIG1vdmVDb2x1bW5zSW5zaWRlQ29sbGFwc2libGVEaXYocm93KTtcbiAgICAgICAgICAgIHJlbmRlckNoZXZyb24ocm93KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgY2hldnJvbkJ0bnMgPSBbLi4uZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmJ0bi10ZC1yZXNwLWNvbGxhcHNlXCIpXTtcbiAgICAgICAgY2hldnJvbkJ0bnMuZm9yRWFjaChjaGV2cm9uQnRuID0+XG4gICAgICAgICAgICBjaGV2cm9uQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBldmVudCA9PiB0b2dnbGVUckNvbGxhcHNlKGV2ZW50LCBjaGV2cm9uQnRuKSlcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZXNldENvbGxhcHNpYmxlcygpIHtcbiAgICAgICAgY29uc3QgYWxsQ29sbGFwc2libGVzID0gWy4uLihkYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50Py5xdWVyeVNlbGVjdG9yQWxsKFwiLnRyLXJlc3AtY29sbGFwc2libGVcIikgfHwgW10pXTtcbiAgICAgICAgYWxsQ29sbGFwc2libGVzLmZvckVhY2goY29sbGFwc2libGUgPT4gY29sbGFwc2libGUucmVtb3ZlKCkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlc2V0SGlkZGVuQ29sdW1ucygpIHtcbiAgICAgICAgY29uc3QgaGlkZGVuQ29sdW1ucyA9IFsuLi5kYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50Py5xdWVyeVNlbGVjdG9yQWxsKFwiLnRoLmhpZGRlbiwgLnRkLmhpZGRlblwiKV07XG4gICAgICAgIGhpZGRlbkNvbHVtbnMuZm9yRWFjaChoaWRkZW5Db2x1bW4gPT4gaGlkZGVuQ29sdW1uLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIikpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlc2V0Q2hldnJvbnMoKSB7XG4gICAgICAgIGNvbnN0IHJvd3MgPSBbLi4uZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudC5xdWVyeVNlbGVjdG9yQWxsKCcudHJbcm9sZT1cInJvd1wiXScpXTtcbiAgICAgICAgcm93cy5mb3JFYWNoKHJvdyA9PiB7XG4gICAgICAgICAgICByb3cucXVlcnlTZWxlY3RvcihcIi50aC5jaGV2cm9uLXRoXCIpPy5yZW1vdmUoKTtcbiAgICAgICAgICAgIHJvdy5xdWVyeVNlbGVjdG9yKFwiLnRkLmNoZXZyb24tdGRcIik/LnJlbW92ZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvblNvcnQoKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgcmVzZXRDb2xsYXBzaWJsZXMoKTtcbiAgICAgICAgICAgIHJlc2V0SGlkZGVuQ29sdW1ucygpO1xuICAgICAgICAgICAgcmVzZXRDaGV2cm9ucygpO1xuICAgICAgICAgICAgcmVuZGVyRWxlbWVudHMoKTtcbiAgICAgICAgfSwgMTAwKTtcbiAgICB9XG5cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBpZiAoY2FuUmVuZGVyICYmIHNjcmVlbk1vZGUgJiYgZGF0YWdyaWRSb3dzUmVmLmN1cnJlbnQubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zdCBoZWFkZXJzID0gWy4uLmRhdGFncmlkUm93c1JlZi5jdXJyZW50WzBdLnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGhcIildO1xuXG4gICAgICAgICAgICAvLyBGb3IgZGVza3RvcCBsZWF2ZSAvIHJlc3RvcmUgZGVmYXVsdC4gRm9yIG90aGVyIHNpdHVhdGlvbnMgdXBkYXRlIHRvIG1vYmlsZSAvIHRhYmxldCBjb2x1bW5zXG4gICAgICAgICAgICBpZiAoc2NyZWVuTW9kZSA9PT0gXCJsYXJnZS1kZXNrdG9wXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAodGFibGVDb250ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHRhYmxlQ29udGVudD8uc2V0QXR0cmlidXRlKFwic3R5bGVcIiwgdGVtcGxhdGVDb2x1bW5zKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzZXRDb2xsYXBzaWJsZXMoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzZXRIaWRkZW5Db2x1bW5zKCk7XG4gICAgICAgICAgICAgICAgICAgIHJlc2V0Q2hldnJvbnMoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICh0YWJsZUNvbnRlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0R3JpZENvbHVtbnMoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzZXRDb2xsYXBzaWJsZXMoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzZXRIaWRkZW5Db2x1bW5zKCk7XG4gICAgICAgICAgICAgICAgICAgIHJlc2V0Q2hldnJvbnMoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyRWxlbWVudHMoKTtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVycy5mb3JFYWNoKGhlYWRlciA9PiBoZWFkZXIuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIG9uU29ydCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERldGVjdCBhIGNoYW5nZSBpbiBEYXRhIGdyaWQgMiBhZnRlciB0aGUgaW5pdGlhbCByZW5kZXJpbmcgb2YgZXZlcnl0aGluZ1xuICAgICAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKCgpID0+IHtcbiAgICAgICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgIGlmIChkYXRhZ3JpZFJvd3NSZWYuY3VycmVudCAhPT0gZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnRyW3JvbGU9cm93XVwiKSkge1xuICAgICAgICAgICAgICAgIGRhdGFncmlkUm93c1JlZi5jdXJyZW50ID0gWy4uLmRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQucXVlcnlTZWxlY3RvckFsbChcIi50cltyb2xlPXJvd11cIildO1xuICAgICAgICAgICAgICAgIGlmIChzY3JlZW5Nb2RlICE9PSBcImxhcmdlLWRlc2t0b3BcIikge1xuICAgICAgICAgICAgICAgICAgICByZXNldENvbGxhcHNpYmxlcygpO1xuICAgICAgICAgICAgICAgICAgICByZXNldEhpZGRlbkNvbHVtbnMoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzZXRDaGV2cm9ucygpO1xuICAgICAgICAgICAgICAgICAgICByZW5kZXJFbGVtZW50cygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShkYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50LCBjb25maWcpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoZGF0YWdyaWRXaWRnZXRSZWYgJiYgZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudCkge1xuICAgICAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShkYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50LCBjb25maWcpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICgpID0+IG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICB9KTtcblxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGlmIChEUyAmJiBEUy5zdGF0dXMgPT09IFwiYXZhaWxhYmxlXCIgJiYgd2lkZ2V0TG9hZGVkID09PSB0cnVlKSB7XG4gICAgICAgICAgICBpZiAoZGF0YWdyaWRSb3dzUmVmLmN1cnJlbnQgIT09IGRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQucXVlcnlTZWxlY3RvckFsbChcIi50cltyb2xlPXJvd11cIikpIHtcbiAgICAgICAgICAgICAgICBkYXRhZ3JpZFJvd3NSZWYuY3VycmVudCA9IFsuLi5kYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudHJbcm9sZT1yb3ddXCIpXTtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNjcmVlbk1vZGUgIT09IFwibGFyZ2UtZGVza3RvcFwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNldENvbGxhcHNpYmxlcygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzZXRIaWRkZW5Db2x1bW5zKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNldENoZXZyb25zKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJFbGVtZW50cygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgMjAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigoKSA9PiB7XG4gICAgICAgICAgICBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICBpZiAoZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudCkge1xuICAgICAgICAgICAgICAgIHNldFRhYmxlQ29udGVudChcbiAgICAgICAgICAgICAgICAgICAgZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudC5xdWVyeVNlbGVjdG9yKFwiLndpZGdldC1kYXRhZ3JpZCAud2lkZ2V0LWRhdGFncmlkLWdyaWQudGFibGVcIilcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShkYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50LCBjb25maWcpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoZGF0YWdyaWRXaWRnZXRSZWYgJiYgZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudCkge1xuICAgICAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShkYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50LCBjb25maWcpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICgpID0+IG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICB9LCBbXSk7XG5cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBpZiAodGFibGVDb250ZW50KSB7XG4gICAgICAgICAgICBzZXRUZW1wbGF0ZUNvbHVtbnModGFibGVDb250ZW50LmdldEF0dHJpYnV0ZShcInN0eWxlXCIpKTtcbiAgICAgICAgICAgIHNjcmVlblNpemVDaGVjaygpO1xuICAgICAgICAgICAgc2V0Q2FuUmVuZGVyKHRydWUpO1xuICAgICAgICB9XG4gICAgfSwgW3RhYmxlQ29udGVudF0pO1xuXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgaWYgKGNhblJlbmRlcikge1xuICAgICAgICAgICAgc2NyZWVuU2l6ZUNoZWNrKCk7XG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCBzY3JlZW5TaXplQ2hlY2spO1xuICAgICAgICAgICAgc2V0V2lkZ2V0TG9hZGVkKHRydWUpO1xuICAgICAgICAgICAgcmV0dXJuICgpID0+IHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHNjcmVlblNpemVDaGVjayk7XG4gICAgICAgIH1cbiAgICB9LCBbY2FuUmVuZGVyXSk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YHJlc3BvbnNpdmUtZGF0YWdyaWQgJHtzdHlsZX1gfSByZWY9e2RhdGFncmlkV2lkZ2V0UmVmfT5cbiAgICAgICAgICAgIHtkYXRhR3JpZFdpZGdldH1cbiAgICAgICAgPC9kaXY+XG4gICAgKTtcbn1cbiJdLCJuYW1lcyI6WyJSZXNwb25zaXZlRGF0YWdyaWRUd28iLCJicmVha3BvaW50cyIsImRhdGFHcmlkV2lkZ2V0IiwiRFMiLCJmb3JjZUF1dG9GaWxsIiwia2VlcExhc3RCb29sZWFuIiwiUmVuZGVyQ2hldnJvbiIsInJlc3QiLCJzdHlsZSIsImNsYXNzIiwiZGF0YWdyaWRXaWRnZXRSZWYiLCJ1c2VSZWYiLCJkYXRhZ3JpZFJvd3NSZWYiLCJ0YWJsZUNvbnRlbnQiLCJzZXRUYWJsZUNvbnRlbnQiLCJ1c2VTdGF0ZSIsImNhblJlbmRlciIsInNldENhblJlbmRlciIsInRlbXBsYXRlQ29sdW1ucyIsInNldFRlbXBsYXRlQ29sdW1ucyIsInNjcmVlbk1vZGUiLCJzZXRTY3JlZW5Nb2RlIiwibWF4Q29sdW1ucyIsInNldE1heENvbHVtbnMiLCJ3aWRnZXRMb2FkZWQiLCJzZXRXaWRnZXRMb2FkZWQiLCJjb25maWciLCJjaGlsZExpc3QiLCJzdWJ0cmVlIiwic2NyZWVuU2l6ZUNoZWNrIiwiYnJlYWtwb2ludHNNYXAiLCJyZWR1Y2UiLCJtYXAiLCJicmVha3BvaW50IiwiZm9yIiwibW9iaWxlIiwidGFibGV0IiwiZGVza3RvcCIsIndpZHRoIiwid2luZG93IiwiaW5uZXJXaWR0aCIsInVuZGVmaW5lZCIsInZhbHVlIiwiY29sdW1ucyIsInNldEdyaWRDb2x1bW5zIiwiY29sdW1uQXJyYXkiLCJyZXBsYWNlIiwic3BsaXQiLCJtYXhDb2x1bW5BcnJheSIsInNsaWNlIiwibGVuZ3RoIiwicHVzaCIsInVuc2hpZnQiLCJzcGxpY2UiLCJzZXRBdHRyaWJ1dGUiLCJqb2luIiwidG9nZ2xlVHJDb2xsYXBzZSIsImV2ZW50IiwiY2hldnJvbkJ0biIsIm5vdENvbGxhcHNlZCIsImRvY3VtZW50IiwicXVlcnlTZWxlY3RvckFsbCIsImZvckVhY2giLCJjaGV2cm9uUm93Iiwicm93QnRuIiwicGFyZW50RWxlbWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJjbGFzc0xpc3QiLCJ0b2dnbGUiLCJ0YXJnZXQiLCJjbG9zZXN0IiwicmVuZGVyQ2hldnJvbiIsInJvdyIsInNlbGVjdFRIIiwiZXh0cmFUSCIsImluc2VydEFkamFjZW50SFRNTCIsInNlbGVjdFREIiwiYm9yZGVyQ2xhc3MiLCJjbGlja2FibGVDbGFzcyIsImV4dHJhVEQiLCJyZW5kZXJDb2xsYXBzaWJsZURpdiIsImNvbGxhcHNpYmxlRGl2IiwibW92ZUNvbHVtbnNJbnNpZGVDb2xsYXBzaWJsZURpdiIsImVuZEluZGV4IiwiVEhzIiwic3RhcnRJbmRleCIsIlRIIiwiYWRkIiwiVERzIiwiVEQiLCJpbmRleCIsImhlYWRlcnMiLCJjdXJyZW50IiwiY29sbGFwc2libGUiLCJjb2xsYXBzaWJsZUNvbnRlbnQiLCJpbm5lckhUTUwiLCJyZW5kZXJFbGVtZW50cyIsImNoZXZyb25CdG5zIiwiYWRkRXZlbnRMaXN0ZW5lciIsInJlc2V0Q29sbGFwc2libGVzIiwiYWxsQ29sbGFwc2libGVzIiwicmVtb3ZlIiwicmVzZXRIaWRkZW5Db2x1bW5zIiwiaGlkZGVuQ29sdW1ucyIsImhpZGRlbkNvbHVtbiIsInJlc2V0Q2hldnJvbnMiLCJyb3dzIiwib25Tb3J0Iiwic2V0VGltZW91dCIsInVzZUVmZmVjdCIsImhlYWRlciIsIm9ic2VydmVyIiwiTXV0YXRpb25PYnNlcnZlciIsImRpc2Nvbm5lY3QiLCJvYnNlcnZlIiwic3RhdHVzIiwiZ2V0QXR0cmlidXRlIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImNyZWF0ZUVsZW1lbnQiLCJjbGFzc05hbWUiLCJyZWYiXSwibWFwcGluZ3MiOiI7O0FBR08sU0FBU0EscUJBQXFCQSxDQUFDO0VBQ2xDQyxXQUFXO0VBQ1hDLGNBQWM7RUFDZEMsRUFBRTtFQUNGQyxhQUFhO0VBQ2JDLGVBQWU7RUFDZkMsYUFBYTtFQUNiLEdBQUdDLElBQUFBO0FBQ1AsQ0FBQyxFQUFFO0FBQ0MsRUFBQSxNQUFNQyxLQUFLLEdBQUdELElBQUksQ0FBQ0UsS0FBSyxJQUFJLEVBQUUsQ0FBQTtBQUM5QixFQUFBLE1BQU1DLGlCQUFpQixHQUFHQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDdEMsRUFBQSxNQUFNQyxlQUFlLEdBQUdELE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQTtFQUNsQyxNQUFNLENBQUNFLFlBQVksRUFBRUMsZUFBZSxDQUFDLEdBQUdDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtFQUN0RCxNQUFNLENBQUNDLFNBQVMsRUFBRUMsWUFBWSxDQUFDLEdBQUdGLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtFQUNqRCxNQUFNLENBQUNHLGVBQWUsRUFBRUMsa0JBQWtCLENBQUMsR0FBR0osUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFBO0VBQzVELE1BQU0sQ0FBQ0ssVUFBVSxFQUFFQyxhQUFhLENBQUMsR0FBR04sUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFBO0VBQ2xELE1BQU0sQ0FBQ08sVUFBVSxFQUFFQyxhQUFh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
