import { useRef, useState, useEffect, createElement } from 'react';

function ResponsiveDatagridTwo({
  dataGridWidget,
  desktopBreakpoint,
  keepLastBoolean,
  maxColumnsMobile,
  maxColumnsTablet,
  forceAutoFill,
  mobileBreakpoint,
  RenderChevron,
  ...rest
}) {
  const style = rest.class || "";
  const datagridWidgetRef = useRef(null);
  const datagridRowsRef = useRef([]);
  const [tableContent, setTableContent] = useState(null);
  const [canRender, setCanRender] = useState(false);
  const [templateColumns, setTemplateColumns] = useState(null);
  const [screenMode, setSceenMode] = useState(null);
  const config = {
    // attributes: true,
    // attributeOldValue: true,
    childList: true,
    // This is a must have for the observer with subtree
    subtree: true // Set to true if changes must also be observed in descendants.
  };
  function screenSizeCheck() {
    if (window.innerWidth <= mobileBreakpoint) {
      if (screenMode !== "mobile") {
        setSceenMode("mobile");
      }
    } else if (window.innerWidth > mobileBreakpoint && window.innerWidth < desktopBreakpoint) {
      if (screenMode !== "tablet") {
        setSceenMode("tablet");
      }
    } else if (window.innerWidth >= desktopBreakpoint) {
      if (screenMode !== "desktop") {
        setSceenMode("desktop");
      }
    }
  }
  useEffect(() => {
    function setGridColumns() {
      const columnArray = templateColumns.replace("grid-template-columns: ", "").split(/ (?![^()]*\))/);
      const visibleColumns = screenMode === "mobile" ? maxColumnsMobile : maxColumnsTablet;
      const maxColumnArray = columnArray.slice(0, columnArray.length - (columnArray.length - visibleColumns) + (keepLastBoolean ? -1 : 0));
      if (keepLastBoolean) {
        maxColumnArray.push("fit-content(100%)");
      }
      maxColumnArray.join(" ").replace(";", "");
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
      const visibleColumns = screenMode === "mobile" ? maxColumnsMobile : maxColumnsTablet;
      // Check first TH if there is no chevron present
      if (!row.querySelector(".th.chevron-th")) {
        const selectTH = RenderChevron === "left" ? row.querySelector(".th") : row.querySelector(`.th:nth-child(${visibleColumns + 1})`);
        const extraTH = `<div class="th chevron-th" role="columnheader"><div class="column-container">&nbsp;</div></div>`;
        if (selectTH && selectTH.querySelector(".td-custom-content") && RenderChevron === "left") {
          selectTH.insertAdjacentHTML("afterend", extraTH);
        } else if (selectTH) {
          selectTH.insertAdjacentHTML("beforebegin", extraTH);
        }
      }

      // Check first TD if there is no chevron present
      if (!row.querySelector(".td.chevron-td")) {
        const selectTD = RenderChevron === "left" ? row.querySelector(".td") : row.querySelector(`.td:nth-child(${visibleColumns + 1})`);
        const borderClass = row.querySelector(".td-borders") ? "td-borders " : "";
        const extraTD = `<div class="td ${borderClass}chevron-td btn-td-resp-collapse" role="gridcell"><div class="td-custom-content"><svg height="16" width="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M8.00004 11.1369C8.21033 11.1369 8.38741 11.0539 8.54789 10.8934L12.4935 6.85368C12.6208 6.72087 12.6872 6.56592 12.6872 6.37777C12.6872 5.9904 12.3829 5.68604 12.0066 5.68604C11.8239 5.68604 11.6469 5.76351 11.5085 5.90186L8.00557 9.50439L4.49158 5.90186C4.35876 5.76904 4.18722 5.68604 3.99353 5.68604C3.61723 5.68604 3.31287 5.9904 3.31287 6.37777C3.31287 6.56038 3.38481 6.72087 3.51208 6.85368L7.45772 10.8934C7.62374 11.0594 7.79529 11.1369 8.00004 11.1369Z"/></svg></div></div>`;
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
      const visibleColumns = screenMode === "mobile" ? maxColumnsMobile : maxColumnsTablet;
      const endIndex = keepLastBoolean ? -1 : 0;
      const THs = [...row.querySelectorAll(".th")];
      if (THs.length) {
        const startIndex = THs.length - (THs.length - visibleColumns) + (keepLastBoolean ? -1 : 0);
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
        const startIndex = TDs.length - (TDs.length - visibleColumns) + (keepLastBoolean ? -1 : 0);
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
      if (window.innerWidth <= mobileBreakpoint || window.innerWidth > mobileBreakpoint && window.innerWidth < desktopBreakpoint) {
        setTimeout(() => {
          resetCollapsibles();
          resetHiddenColumns();
          resetChevrons();
          renderElements();
        }, 100);
      }
    }
    if (canRender && screenMode) {
      const headers = [...datagridRowsRef.current[0].querySelectorAll(".th")];

      // For desktop leave / restore default. For other situations update to mobile / tablet columns
      if (screenMode === "desktop") {
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
        if (screenMode !== "desktop") {
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
  });
  useEffect(() => {
    if (tableContent) {
      setTemplateColumns(tableContent.getAttribute("style"));
      if (window.innerWidth <= mobileBreakpoint) {
        setSceenMode("mobile");
      } else if (window.innerWidth > mobileBreakpoint && window.innerWidth < desktopBreakpoint) {
        setSceenMode("tablet");
      } else if (window.innerWidth >= desktopBreakpoint) {
        setSceenMode("desktop");
      }
      setCanRender(true);
    }
  }, [desktopBreakpoint, mobileBreakpoint, tableContent]);
  if (canRender) {
    window.addEventListener("resize", screenSizeCheck);
  }
  return createElement("div", {
    className: `responsive-datagrid ${style}`,
    ref: datagridWidgetRef
  }, dataGridWidget);
}

export { ResponsiveDatagridTwo };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzcG9uc2l2ZURhdGFncmlkVHdvLm1qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL1Jlc3BvbnNpdmVEYXRhZ3JpZFR3by5qc3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFwiLi91aS9SZXNwb25zaXZlRGF0YWdyaWRUd28uY3NzXCI7XG5pbXBvcnQgeyBjcmVhdGVFbGVtZW50LCB1c2VFZmZlY3QsIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIFJlc3BvbnNpdmVEYXRhZ3JpZFR3byh7XG4gICAgZGF0YUdyaWRXaWRnZXQsXG4gICAgZGVza3RvcEJyZWFrcG9pbnQsXG4gICAga2VlcExhc3RCb29sZWFuLFxuICAgIG1heENvbHVtbnNNb2JpbGUsXG4gICAgbWF4Q29sdW1uc1RhYmxldCxcbiAgICBmb3JjZUF1dG9GaWxsLFxuICAgIG1vYmlsZUJyZWFrcG9pbnQsXG4gICAgUmVuZGVyQ2hldnJvbixcbiAgICAuLi5yZXN0XG59KSB7XG4gICAgY29uc3Qgc3R5bGUgPSByZXN0LmNsYXNzIHx8IFwiXCI7XG4gICAgY29uc3QgZGF0YWdyaWRXaWRnZXRSZWYgPSB1c2VSZWYobnVsbCk7XG4gICAgY29uc3QgZGF0YWdyaWRSb3dzUmVmID0gdXNlUmVmKFtdKTtcbiAgICBjb25zdCBbdGFibGVDb250ZW50LCBzZXRUYWJsZUNvbnRlbnRdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW2NhblJlbmRlciwgc2V0Q2FuUmVuZGVyXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCBbdGVtcGxhdGVDb2x1bW5zLCBzZXRUZW1wbGF0ZUNvbHVtbnNdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW3NjcmVlbk1vZGUsIHNldFNjZWVuTW9kZV0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBjb25maWcgPSB7XG4gICAgICAgIC8vIGF0dHJpYnV0ZXM6IHRydWUsXG4gICAgICAgIC8vIGF0dHJpYnV0ZU9sZFZhbHVlOiB0cnVlLFxuICAgICAgICBjaGlsZExpc3Q6IHRydWUsIC8vIFRoaXMgaXMgYSBtdXN0IGhhdmUgZm9yIHRoZSBvYnNlcnZlciB3aXRoIHN1YnRyZWVcbiAgICAgICAgc3VidHJlZTogdHJ1ZSAvLyBTZXQgdG8gdHJ1ZSBpZiBjaGFuZ2VzIG11c3QgYWxzbyBiZSBvYnNlcnZlZCBpbiBkZXNjZW5kYW50cy5cbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gc2NyZWVuU2l6ZUNoZWNrKCkge1xuICAgICAgICBpZiAod2luZG93LmlubmVyV2lkdGggPD0gbW9iaWxlQnJlYWtwb2ludCkge1xuICAgICAgICAgICAgaWYgKHNjcmVlbk1vZGUgIT09IFwibW9iaWxlXCIpIHtcbiAgICAgICAgICAgICAgICBzZXRTY2Vlbk1vZGUoXCJtb2JpbGVcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAod2luZG93LmlubmVyV2lkdGggPiBtb2JpbGVCcmVha3BvaW50ICYmIHdpbmRvdy5pbm5lcldpZHRoIDwgZGVza3RvcEJyZWFrcG9pbnQpIHtcbiAgICAgICAgICAgIGlmIChzY3JlZW5Nb2RlICE9PSBcInRhYmxldFwiKSB7XG4gICAgICAgICAgICAgICAgc2V0U2NlZW5Nb2RlKFwidGFibGV0XCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHdpbmRvdy5pbm5lcldpZHRoID49IGRlc2t0b3BCcmVha3BvaW50KSB7XG4gICAgICAgICAgICBpZiAoc2NyZWVuTW9kZSAhPT0gXCJkZXNrdG9wXCIpIHtcbiAgICAgICAgICAgICAgICBzZXRTY2Vlbk1vZGUoXCJkZXNrdG9wXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgZnVuY3Rpb24gc2V0R3JpZENvbHVtbnMoKSB7XG4gICAgICAgICAgICBjb25zdCBjb2x1bW5BcnJheSA9IHRlbXBsYXRlQ29sdW1ucy5yZXBsYWNlKFwiZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiBcIiwgXCJcIikuc3BsaXQoLyAoPyFbXigpXSpcXCkpLyk7XG4gICAgICAgICAgICBjb25zdCB2aXNpYmxlQ29sdW1ucyA9IHNjcmVlbk1vZGUgPT09IFwibW9iaWxlXCIgPyBtYXhDb2x1bW5zTW9iaWxlIDogbWF4Q29sdW1uc1RhYmxldDtcbiAgICAgICAgICAgIGNvbnN0IG1heENvbHVtbkFycmF5ID0gY29sdW1uQXJyYXkuc2xpY2UoXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICBjb2x1bW5BcnJheS5sZW5ndGggLSAoY29sdW1uQXJyYXkubGVuZ3RoIC0gdmlzaWJsZUNvbHVtbnMpICsgKGtlZXBMYXN0Qm9vbGVhbiA/IC0xIDogMClcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGlmIChrZWVwTGFzdEJvb2xlYW4pIHtcbiAgICAgICAgICAgICAgICBtYXhDb2x1bW5BcnJheS5wdXNoKFwiZml0LWNvbnRlbnQoMTAwJSlcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtYXhDb2x1bW5BcnJheS5qb2luKFwiIFwiKS5yZXBsYWNlKFwiO1wiLCBcIlwiKTtcblxuICAgICAgICAgICAgaWYgKFJlbmRlckNoZXZyb24gPT09IFwicmlnaHRcIikge1xuICAgICAgICAgICAgICAgIG1heENvbHVtbkFycmF5LnB1c2goXCJmaXQtY29udGVudCgxMDAlKVwiKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbWF4Q29sdW1uQXJyYXkudW5zaGlmdChcImZpdC1jb250ZW50KDEwMCUpXCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZm9yY2VBdXRvRmlsbCkge1xuICAgICAgICAgICAgICAgIG1heENvbHVtbkFycmF5LnNwbGljZSgyLCAxLCBcIjFmclwiKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGFibGVDb250ZW50LnNldEF0dHJpYnV0ZShcInN0eWxlXCIsIGBncmlkLXRlbXBsYXRlLWNvbHVtbnM6ICR7bWF4Q29sdW1uQXJyYXkuam9pbihcIiBcIikucmVwbGFjZShcIjtcIiwgXCJcIil9O2ApO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gdG9nZ2xlVHJDb2xsYXBzZShldmVudCwgY2hldnJvbkJ0bikge1xuICAgICAgICAgICAgY29uc3Qgbm90Q29sbGFwc2VkID0gW1xuICAgICAgICAgICAgICAgIC4uLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudHItcmVzcC1jb2xsYXBzaWJsZTpub3QoLnRyLXJlc3AtY29sbGFwc2libGUtLWNvbGxhcHNlZClcIilcbiAgICAgICAgICAgIF07XG4gICAgICAgICAgICBpZiAobm90Q29sbGFwc2VkLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIG5vdENvbGxhcHNlZC5mb3JFYWNoKGNoZXZyb25Sb3cgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByb3dCdG4gPSBjaGV2cm9uUm93LnBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5idG4tdGQtcmVzcC1jb2xsYXBzZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJvd0J0biAhPT0gY2hldnJvbkJ0bikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hldnJvblJvdy5jbGFzc0xpc3QudG9nZ2xlKFwidHItcmVzcC1jb2xsYXBzaWJsZS0tY29sbGFwc2VkXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hldnJvblJvdy5wYXJlbnRFbGVtZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnF1ZXJ5U2VsZWN0b3IoXCIuYnRuLXRkLXJlc3AtY29sbGFwc2VcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY2xhc3NMaXN0LnRvZ2dsZShcImJ0bi10ZC1yZXNwLWNvbGxhcHNlLS1hY3RpdmVcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2hldnJvbkJ0bi5jbGFzc0xpc3QudG9nZ2xlKFwiYnRuLXRkLXJlc3AtY29sbGFwc2UtLWFjdGl2ZVwiKTtcbiAgICAgICAgICAgIGV2ZW50LnRhcmdldFxuICAgICAgICAgICAgICAgIC5jbG9zZXN0KFwiLnRyXCIpXG4gICAgICAgICAgICAgICAgLnF1ZXJ5U2VsZWN0b3IoXCIudHItcmVzcC1jb2xsYXBzaWJsZVwiKVxuICAgICAgICAgICAgICAgIC5jbGFzc0xpc3QudG9nZ2xlKFwidHItcmVzcC1jb2xsYXBzaWJsZS0tY29sbGFwc2VkXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2hlY2sgdGhlIGNvbHVtbiB0byBpbnNlcnQgdGhlIGNoZXZyb25cbiAgICAgICAgZnVuY3Rpb24gcmVuZGVyQ2hldnJvbihyb3cpIHtcbiAgICAgICAgICAgIGNvbnN0IHZpc2libGVDb2x1bW5zID0gc2NyZWVuTW9kZSA9PT0gXCJtb2JpbGVcIiA/IG1heENvbHVtbnNNb2JpbGUgOiBtYXhDb2x1bW5zVGFibGV0O1xuICAgICAgICAgICAgLy8gQ2hlY2sgZmlyc3QgVEggaWYgdGhlcmUgaXMgbm8gY2hldnJvbiBwcmVzZW50XG4gICAgICAgICAgICBpZiAoIXJvdy5xdWVyeVNlbGVjdG9yKFwiLnRoLmNoZXZyb24tdGhcIikpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzZWxlY3RUSCA9XG4gICAgICAgICAgICAgICAgICAgIFJlbmRlckNoZXZyb24gPT09IFwibGVmdFwiXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHJvdy5xdWVyeVNlbGVjdG9yKFwiLnRoXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICA6IHJvdy5xdWVyeVNlbGVjdG9yKGAudGg6bnRoLWNoaWxkKCR7dmlzaWJsZUNvbHVtbnMgKyAxfSlgKTtcbiAgICAgICAgICAgICAgICBjb25zdCBleHRyYVRIID0gYDxkaXYgY2xhc3M9XCJ0aCBjaGV2cm9uLXRoXCIgcm9sZT1cImNvbHVtbmhlYWRlclwiPjxkaXYgY2xhc3M9XCJjb2x1bW4tY29udGFpbmVyXCI+Jm5ic3A7PC9kaXY+PC9kaXY+YDtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZWN0VEggJiYgc2VsZWN0VEgucXVlcnlTZWxlY3RvcihcIi50ZC1jdXN0b20tY29udGVudFwiKSAmJiBSZW5kZXJDaGV2cm9uID09PSBcImxlZnRcIikge1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3RUSC5pbnNlcnRBZGphY2VudEhUTUwoXCJhZnRlcmVuZFwiLCBleHRyYVRIKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNlbGVjdFRIKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdFRILmluc2VydEFkamFjZW50SFRNTChcImJlZm9yZWJlZ2luXCIsIGV4dHJhVEgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQ2hlY2sgZmlyc3QgVEQgaWYgdGhlcmUgaXMgbm8gY2hldnJvbiBwcmVzZW50XG4gICAgICAgICAgICBpZiAoIXJvdy5xdWVyeVNlbGVjdG9yKFwiLnRkLmNoZXZyb24tdGRcIikpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzZWxlY3RURCA9XG4gICAgICAgICAgICAgICAgICAgIFJlbmRlckNoZXZyb24gPT09IFwibGVmdFwiXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHJvdy5xdWVyeVNlbGVjdG9yKFwiLnRkXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICA6IHJvdy5xdWVyeVNlbGVjdG9yKGAudGQ6bnRoLWNoaWxkKCR7dmlzaWJsZUNvbHVtbnMgKyAxfSlgKTtcbiAgICAgICAgICAgICAgICBjb25zdCBib3JkZXJDbGFzcyA9IHJvdy5xdWVyeVNlbGVjdG9yKFwiLnRkLWJvcmRlcnNcIikgPyBcInRkLWJvcmRlcnMgXCIgOiBcIlwiO1xuICAgICAgICAgICAgICAgIGNvbnN0IGV4dHJhVEQgPSBgPGRpdiBjbGFzcz1cInRkICR7Ym9yZGVyQ2xhc3N9Y2hldnJvbi10ZCBidG4tdGQtcmVzcC1jb2xsYXBzZVwiIHJvbGU9XCJncmlkY2VsbFwiPjxkaXYgY2xhc3M9XCJ0ZC1jdXN0b20tY29udGVudFwiPjxzdmcgaGVpZ2h0PVwiMTZcIiB3aWR0aD1cIjE2XCIgdmlld0JveD1cIjAgMCAxNiAxNlwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiBmaWxsPVwiY3VycmVudENvbG9yXCI+PHBhdGggZD1cIk04LjAwMDA0IDExLjEzNjlDOC4yMTAzMyAxMS4xMzY5IDguMzg3NDEgMTEuMDUzOSA4LjU0Nzg5IDEwLjg5MzRMMTIuNDkzNSA2Ljg1MzY4QzEyLjYyMDggNi43MjA4NyAxMi42ODcyIDYuNTY1OTIgMTIuNjg3MiA2LjM3Nzc3QzEyLjY4NzIgNS45OTA0IDEyLjM4MjkgNS42ODYwNCAxMi4wMDY2IDUuNjg2MDRDMTEuODIzOSA1LjY4NjA0IDExLjY0NjkgNS43NjM1MSAxMS41MDg1IDUuOTAxODZMOC4wMDU1NyA5LjUwNDM5TDQuNDkxNTggNS45MDE4NkM0LjM1ODc2IDUuNzY5MDQgNC4xODcyMiA1LjY4NjA0IDMuOTkzNTMgNS42ODYwNEMzLjYxNzIzIDUuNjg2MDQgMy4zMTI4NyA1Ljk5MDQgMy4zMTI4NyA2LjM3Nzc3QzMuMzEyODcgNi41NjAzOCAzLjM4NDgxIDYuNzIwODcgMy41MTIwOCA2Ljg1MzY4TDcuNDU3NzIgMTAuODkzNEM3LjYyMzc0IDExLjA1OTQgNy43OTUyOSAxMS4xMzY5IDguMDAwMDQgMTEuMTM2OVpcIi8+PC9zdmc+PC9kaXY+PC9kaXY+YDtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZWN0VEQgJiYgc2VsZWN0VEQucXVlcnlTZWxlY3RvcihcIi50ZC1jdXN0b20tY29udGVudFwiKSAmJiBSZW5kZXJDaGV2cm9uID09PSBcImxlZnRcIikge1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3RURC5pbnNlcnRBZGphY2VudEhUTUwoXCJhZnRlcmVuZFwiLCBleHRyYVREKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNlbGVjdFREKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdFRELmluc2VydEFkamFjZW50SFRNTChcImJlZm9yZWJlZ2luXCIsIGV4dHJhVEQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHJlbmRlckNvbGxhcHNpYmxlRGl2KHJvdykge1xuICAgICAgICAgICAgY29uc3QgY29sbGFwc2libGVEaXYgPSBgPGRpdiBjbGFzcz1cInRyLXJlc3AtY29sbGFwc2libGUgdHItcmVzcC1jb2xsYXBzaWJsZS0tY29sbGFwc2VkXCI+PC9kaXY+YDtcbiAgICAgICAgICAgIGlmICghcm93LnF1ZXJ5U2VsZWN0b3IoXCIudHItcmVzcC1jb2xsYXBzaWJsZVwiKSkge1xuICAgICAgICAgICAgICAgIHJvdy5pbnNlcnRBZGphY2VudEhUTUwoXCJiZWZvcmVlbmRcIiwgY29sbGFwc2libGVEaXYpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gbW92ZUNvbHVtbnNJbnNpZGVDb2xsYXBzaWJsZURpdihyb3cpIHtcbiAgICAgICAgICAgIGNvbnN0IHZpc2libGVDb2x1bW5zID0gc2NyZWVuTW9kZSA9PT0gXCJtb2JpbGVcIiA/IG1heENvbHVtbnNNb2JpbGUgOiBtYXhDb2x1bW5zVGFibGV0O1xuICAgICAgICAgICAgY29uc3QgZW5kSW5kZXggPSBrZWVwTGFzdEJvb2xlYW4gPyAtMSA6IDA7XG4gICAgICAgICAgICBjb25zdCBUSHMgPSBbLi4ucm93LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGhcIildO1xuXG4gICAgICAgICAgICBpZiAoVEhzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXJ0SW5kZXggPSBUSHMubGVuZ3RoIC0gKFRIcy5sZW5ndGggLSB2aXNpYmxlQ29sdW1ucykgKyAoa2VlcExhc3RCb29sZWFuID8gLTEgOiAwKTtcblxuICAgICAgICAgICAgICAgIGlmIChrZWVwTGFzdEJvb2xlYW4pIHtcbiAgICAgICAgICAgICAgICAgICAgVEhzLnNsaWNlKHN0YXJ0SW5kZXgsIGVuZEluZGV4KS5mb3JFYWNoKFRIID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFRILmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIFRIcy5zbGljZShzdGFydEluZGV4KS5mb3JFYWNoKFRIID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFRILmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgVERzID0gWy4uLnJvdy5xdWVyeVNlbGVjdG9yQWxsKFwiLnRkXCIpXTtcbiAgICAgICAgICAgIGlmIChURHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhcnRJbmRleCA9IFREcy5sZW5ndGggLSAoVERzLmxlbmd0aCAtIHZpc2libGVDb2x1bW5zKSArIChrZWVwTGFzdEJvb2xlYW4gPyAtMSA6IDApO1xuXG4gICAgICAgICAgICAgICAgaWYgKGtlZXBMYXN0Qm9vbGVhbikge1xuICAgICAgICAgICAgICAgICAgICBURHMuc2xpY2Uoc3RhcnRJbmRleCwgZW5kSW5kZXgpLmZvckVhY2goKFRELCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgVEQuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGhlYWRlcnMgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnLndpZGdldC1kYXRhZ3JpZCAudHJbcm9sZT1cInJvd1wiXTpmaXJzdC1jaGlsZCAudGguaGlkZGVuJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb2xsYXBzaWJsZSA9IHJvdy5xdWVyeVNlbGVjdG9yKFwiLnRyLXJlc3AtY29sbGFwc2libGVcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb2xsYXBzaWJsZUNvbnRlbnQgPSBgPGRpdiBjbGFzcz1cInRyLXJlc3AtY29sbGFwc2libGVfX2l0ZW1cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzcz1cInRkLXRleHQgdGV4dC1ib2xkIG5vbWFyZ2luXCI+JHtoZWFkZXJzW2luZGV4XT8ucXVlcnlTZWxlY3RvcihcInNwYW5cIikuaW5uZXJIVE1MfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0ZC10ZXh0XCI+JHtURC5xdWVyeVNlbGVjdG9yKFwic3BhblwiKT8uaW5uZXJIVE1MfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5gO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29sbGFwc2libGUuaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYmVmb3JlZW5kXCIsIGNvbGxhcHNpYmxlQ29udGVudCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIFREcy5zbGljZShzdGFydEluZGV4KS5mb3JFYWNoKChURCwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFRELmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBoZWFkZXJzID0gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLmRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJy53aWRnZXQtZGF0YWdyaWQgLnRyW3JvbGU9XCJyb3dcIl06Zmlyc3QtY2hpbGQgLnRoLmhpZGRlbidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sbGFwc2libGUgPSByb3cucXVlcnlTZWxlY3RvcihcIi50ci1yZXNwLWNvbGxhcHNpYmxlXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sbGFwc2libGVDb250ZW50ID0gYDxkaXYgY2xhc3M9XCJ0ci1yZXNwLWNvbGxhcHNpYmxlX19pdGVtXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzcz1cInRkLXRleHQgdGV4dC1ib2xkIG5vbWFyZ2luXCI+JHtoZWFkZXJzW2luZGV4XT8ucXVlcnlTZWxlY3RvcihcInNwYW5cIikuaW5uZXJIVE1MfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRkLXRleHRcIj4ke1RELnF1ZXJ5U2VsZWN0b3IoXCJzcGFuXCIpPy5pbm5lckhUTUx9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+YDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxhcHNpYmxlLmluc2VydEFkamFjZW50SFRNTChcImJlZm9yZWVuZFwiLCBjb2xsYXBzaWJsZUNvbnRlbnQpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiByZW5kZXJFbGVtZW50cygpIHtcbiAgICAgICAgICAgIC8vIFByb2Nlc3MgZWFjaCByb3dcbiAgICAgICAgICAgIGRhdGFncmlkUm93c1JlZi5jdXJyZW50LmZvckVhY2gocm93ID0+IHtcbiAgICAgICAgICAgICAgICByZW5kZXJDb2xsYXBzaWJsZURpdihyb3cpO1xuICAgICAgICAgICAgICAgIG1vdmVDb2x1bW5zSW5zaWRlQ29sbGFwc2libGVEaXYocm93KTtcbiAgICAgICAgICAgICAgICByZW5kZXJDaGV2cm9uKHJvdyk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgY29uc3QgY2hldnJvbkJ0bnMgPSBbLi4uZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmJ0bi10ZC1yZXNwLWNvbGxhcHNlXCIpXTtcbiAgICAgICAgICAgIGNoZXZyb25CdG5zLmZvckVhY2goY2hldnJvbkJ0biA9PlxuICAgICAgICAgICAgICAgIGNoZXZyb25CdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGV2ZW50ID0+IHRvZ2dsZVRyQ29sbGFwc2UoZXZlbnQsIGNoZXZyb25CdG4pKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHJlc2V0Q29sbGFwc2libGVzKCkge1xuICAgICAgICAgICAgY29uc3QgYWxsQ29sbGFwc2libGVzID0gWy4uLmRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQucXVlcnlTZWxlY3RvckFsbChcIi50ci1yZXNwLWNvbGxhcHNpYmxlXCIpXTtcbiAgICAgICAgICAgIGFsbENvbGxhcHNpYmxlcy5mb3JFYWNoKGNvbGxhcHNpYmxlID0+IGNvbGxhcHNpYmxlLnJlbW92ZSgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHJlc2V0SGlkZGVuQ29sdW1ucygpIHtcbiAgICAgICAgICAgIGNvbnN0IGhpZGRlbkNvbHVtbnMgPSBbLi4uZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnRoLmhpZGRlbiwgLnRkLmhpZGRlblwiKV07XG4gICAgICAgICAgICBoaWRkZW5Db2x1bW5zLmZvckVhY2goaGlkZGVuQ29sdW1uID0+IGhpZGRlbkNvbHVtbi5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHJlc2V0Q2hldnJvbnMoKSB7XG4gICAgICAgICAgICBjb25zdCByb3dzID0gWy4uLmRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQucXVlcnlTZWxlY3RvckFsbCgnLnRyW3JvbGU9XCJyb3dcIl0nKV07XG4gICAgICAgICAgICByb3dzLmZvckVhY2gocm93ID0+IHtcbiAgICAgICAgICAgICAgICByb3cucXVlcnlTZWxlY3RvcihcIi50aC5jaGV2cm9uLXRoXCIpPy5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICByb3cucXVlcnlTZWxlY3RvcihcIi50ZC5jaGV2cm9uLXRkXCIpPy5yZW1vdmUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gb25Tb3J0KCkge1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIHdpbmRvdy5pbm5lcldpZHRoIDw9IG1vYmlsZUJyZWFrcG9pbnQgfHxcbiAgICAgICAgICAgICAgICAod2luZG93LmlubmVyV2lkdGggPiBtb2JpbGVCcmVha3BvaW50ICYmIHdpbmRvdy5pbm5lcldpZHRoIDwgZGVza3RvcEJyZWFrcG9pbnQpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzZXRDb2xsYXBzaWJsZXMoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzZXRIaWRkZW5Db2x1bW5zKCk7XG4gICAgICAgICAgICAgICAgICAgIHJlc2V0Q2hldnJvbnMoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyRWxlbWVudHMoKTtcbiAgICAgICAgICAgICAgICB9LCAxMDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNhblJlbmRlciAmJiBzY3JlZW5Nb2RlKSB7XG4gICAgICAgICAgICBjb25zdCBoZWFkZXJzID0gWy4uLmRhdGFncmlkUm93c1JlZi5jdXJyZW50WzBdLnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGhcIildO1xuXG4gICAgICAgICAgICAvLyBGb3IgZGVza3RvcCBsZWF2ZSAvIHJlc3RvcmUgZGVmYXVsdC4gRm9yIG90aGVyIHNpdHVhdGlvbnMgdXBkYXRlIHRvIG1vYmlsZSAvIHRhYmxldCBjb2x1bW5zXG4gICAgICAgICAgICBpZiAoc2NyZWVuTW9kZSA9PT0gXCJkZXNrdG9wXCIpIHtcbiAgICAgICAgICAgICAgICB0YWJsZUNvbnRlbnQuc2V0QXR0cmlidXRlKFwic3R5bGVcIiwgdGVtcGxhdGVDb2x1bW5zKTtcbiAgICAgICAgICAgICAgICByZXNldENvbGxhcHNpYmxlcygpO1xuICAgICAgICAgICAgICAgIHJlc2V0SGlkZGVuQ29sdW1ucygpO1xuICAgICAgICAgICAgICAgIHJlc2V0Q2hldnJvbnMoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2V0R3JpZENvbHVtbnMoKTtcbiAgICAgICAgICAgICAgICByZXNldENvbGxhcHNpYmxlcygpO1xuICAgICAgICAgICAgICAgIHJlc2V0SGlkZGVuQ29sdW1ucygpO1xuICAgICAgICAgICAgICAgIHJlc2V0Q2hldnJvbnMoKTtcbiAgICAgICAgICAgICAgICByZW5kZXJFbGVtZW50cygpO1xuICAgICAgICAgICAgICAgIGhlYWRlcnMuZm9yRWFjaChoZWFkZXIgPT4gaGVhZGVyLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBvblNvcnQpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERldGVjdCBhIGNoYW5nZSBpbiBEYXRhIGdyaWQgMiBhZnRlciB0aGUgaW5pdGlhbCByZW5kZXJpbmcgb2YgZXZlcnl0aGluZ1xuICAgICAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKCgpID0+IHtcbiAgICAgICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgIGlmIChkYXRhZ3JpZFJvd3NSZWYuY3VycmVudCAhPT0gZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnRyW3JvbGU9cm93XVwiKSkge1xuICAgICAgICAgICAgICAgIGRhdGFncmlkUm93c1JlZi5jdXJyZW50ID0gWy4uLmRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQucXVlcnlTZWxlY3RvckFsbChcIi50cltyb2xlPXJvd11cIildO1xuICAgICAgICAgICAgICAgIGlmIChzY3JlZW5Nb2RlICE9PSBcImRlc2t0b3BcIikge1xuICAgICAgICAgICAgICAgICAgICByZXNldENvbGxhcHNpYmxlcygpO1xuICAgICAgICAgICAgICAgICAgICByZXNldEhpZGRlbkNvbHVtbnMoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzZXRDaGV2cm9ucygpO1xuICAgICAgICAgICAgICAgICAgICByZW5kZXJFbGVtZW50cygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShkYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50LCBjb25maWcpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoZGF0YWdyaWRXaWRnZXRSZWYgJiYgZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudCkge1xuICAgICAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShkYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50LCBjb25maWcpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICgpID0+IG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICB9KTtcblxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgaWYgKGRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICBzZXRUYWJsZUNvbnRlbnQoZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudC5xdWVyeVNlbGVjdG9yKFwiLndpZGdldC1kYXRhZ3JpZCAud2lkZ2V0LWRhdGFncmlkLWdyaWQtYm9keVwiKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQsIGNvbmZpZyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChkYXRhZ3JpZFdpZGdldFJlZiAmJiBkYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQsIGNvbmZpZyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKCkgPT4gb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgIH0pO1xuXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgaWYgKHRhYmxlQ29udGVudCkge1xuICAgICAgICAgICAgc2V0VGVtcGxhdGVDb2x1bW5zKHRhYmxlQ29udGVudC5nZXRBdHRyaWJ1dGUoXCJzdHlsZVwiKSk7XG4gICAgICAgICAgICBpZiAod2luZG93LmlubmVyV2lkdGggPD0gbW9iaWxlQnJlYWtwb2ludCkge1xuICAgICAgICAgICAgICAgIHNldFNjZWVuTW9kZShcIm1vYmlsZVwiKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAod2luZG93LmlubmVyV2lkdGggPiBtb2JpbGVCcmVha3BvaW50ICYmIHdpbmRvdy5pbm5lcldpZHRoIDwgZGVza3RvcEJyZWFrcG9pbnQpIHtcbiAgICAgICAgICAgICAgICBzZXRTY2Vlbk1vZGUoXCJ0YWJsZXRcIik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHdpbmRvdy5pbm5lcldpZHRoID49IGRlc2t0b3BCcmVha3BvaW50KSB7XG4gICAgICAgICAgICAgICAgc2V0U2NlZW5Nb2RlKFwiZGVza3RvcFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNldENhblJlbmRlcih0cnVlKTtcbiAgICAgICAgfVxuICAgIH0sIFtkZXNrdG9wQnJlYWtwb2ludCwgbW9iaWxlQnJlYWtwb2ludCwgdGFibGVDb250ZW50XSk7XG5cbiAgICBpZiAoY2FuUmVuZGVyKSB7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHNjcmVlblNpemVDaGVjayk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e2ByZXNwb25zaXZlLWRhdGFncmlkICR7c3R5bGV9YH0gcmVmPXtkYXRhZ3JpZFdpZGdldFJlZn0+XG4gICAgICAgICAgICB7ZGF0YUdyaWRXaWRnZXR9XG4gICAgICAgIDwvZGl2PlxuICAgICk7XG59XG4iXSwibmFtZXMiOlsiUmVzcG9uc2l2ZURhdGFncmlkVHdvIiwiZGF0YUdyaWRXaWRnZXQiLCJkZXNrdG9wQnJlYWtwb2ludCIsImtlZXBMYXN0Qm9vbGVhbiIsIm1heENvbHVtbnNNb2JpbGUiLCJtYXhDb2x1bW5zVGFibGV0IiwiZm9yY2VBdXRvRmlsbCIsIm1vYmlsZUJyZWFrcG9pbnQiLCJSZW5kZXJDaGV2cm9uIiwicmVzdCIsInN0eWxlIiwiY2xhc3MiLCJkYXRhZ3JpZFdpZGdldFJlZiIsInVzZVJlZiIsImRhdGFncmlkUm93c1JlZiIsInRhYmxlQ29udGVudCIsInNldFRhYmxlQ29udGVudCIsInVzZVN0YXRlIiwiY2FuUmVuZGVyIiwic2V0Q2FuUmVuZGVyIiwidGVtcGxhdGVDb2x1bW5zIiwic2V0VGVtcGxhdGVDb2x1bW5zIiwic2NyZWVuTW9kZSIsInNldFNjZWVuTW9kZSIsImNvbmZpZyIsImNoaWxkTGlzdCIsInN1YnRyZWUiLCJzY3JlZW5TaXplQ2hlY2siLCJ3aW5kb3ciLCJpbm5lcldpZHRoIiwidXNlRWZmZWN0Iiwic2V0R3JpZENvbHVtbnMiLCJjb2x1bW5BcnJheSIsInJlcGxhY2UiLCJzcGxpdCIsInZpc2libGVDb2x1bW5zIiwibWF4Q29sdW1uQXJyYXkiLCJzbGljZSIsImxlbmd0aCIsInB1c2giLCJqb2luIiwidW5zaGlmdCIsInNwbGljZSIsInNldEF0dHJpYnV0ZSIsInRvZ2dsZVRyQ29sbGFwc2UiLCJldmVudCIsImNoZXZyb25CdG4iLCJub3RDb2xsYXBzZWQiLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJmb3JFYWNoIiwiY2hldnJvblJvdyIsInJvd0J0biIsInBhcmVudEVsZW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwiY2xhc3NMaXN0IiwidG9nZ2xlIiwidGFyZ2V0IiwiY2xvc2VzdCIsInJlbmRlckNoZXZyb24iLCJyb3ciLCJzZWxlY3RUSCIsImV4dHJhVEgiLCJpbnNlcnRBZGphY2VudEhUTUwiLCJzZWxlY3RURCIsImJvcmRlckNsYXNzIiwiZXh0cmFURCIsInJlbmRlckNvbGxhcHNpYmxlRGl2IiwiY29sbGFwc2libGVEaXYiLCJtb3ZlQ29sdW1uc0luc2lkZUNvbGxhcHNpYmxlRGl2IiwiZW5kSW5kZXgiLCJUSHMiLCJzdGFydEluZGV4IiwiVEgiLCJhZGQiLCJURHMiLCJURCIsImluZGV4IiwiaGVhZGVycyIsImN1cnJlbnQiLCJjb2xsYXBzaWJsZSIsImNvbGxhcHNpYmxlQ29udGVudCIsImlubmVySFRNTCIsInJlbmRlckVsZW1lbnRzIiwiY2hldnJvbkJ0bnMiLCJhZGRFdmVudExpc3RlbmVyIiwicmVzZXRDb2xsYXBzaWJsZXMiLCJhbGxDb2xsYXBzaWJsZXMiLCJyZW1vdmUiLCJyZXNldEhpZGRlbkNvbHVtbnMiLCJoaWRkZW5Db2x1bW5zIiwiaGlkZGVuQ29sdW1uIiwicmVzZXRDaGV2cm9ucyIsInJvd3MiLCJvblNvcnQiLCJzZXRUaW1lb3V0IiwiaGVhZGVyIiwib2JzZXJ2ZXIiLCJNdXRhdGlvbk9ic2VydmVyIiwiZGlzY29ubmVj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
