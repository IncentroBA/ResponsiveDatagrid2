define(['exports', 'react'], (function (exports, react) { 'use strict';

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
      const datagridWidgetRef = react.useRef(null);
      const datagridRowsRef = react.useRef([]);
      const [tableContent, setTableContent] = react.useState(null);
      const [canRender, setCanRender] = react.useState(false);
      const [templateColumns, setTemplateColumns] = react.useState(null);
      const [screenMode, setScreenMode] = react.useState(null);
      const [maxColumns, setMaxColumns] = react.useState(100);
      const [widgetLoaded, setWidgetLoaded] = react.useState(false);
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
        const allCollapsibles = [...datagridWidgetRef.current?.querySelectorAll(".tr-resp-collapsible")];
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
      react.useEffect(() => {
        if (canRender && screenMode && datagridRowsRef.current.length) {
          const headers = [...datagridRowsRef.current[0].querySelectorAll(".th")];

          // For desktop leave / restore default. For other situations update to mobile / tablet columns
          if (screenMode === "large-desktop") {
            tableContent?.setAttribute("style", templateColumns);
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
      react.useEffect(() => {
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
      react.useEffect(() => {
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
      react.useEffect(() => {
        if (tableContent) {
          setTemplateColumns(tableContent.getAttribute("style"));
          screenSizeCheck();
          setCanRender(true);
        }
      }, [tableContent]);
      react.useEffect(() => {
        if (canRender) {
          screenSizeCheck();
          window.addEventListener("resize", screenSizeCheck);
          setWidgetLoaded(true);
          return () => window.removeEventListener("resize", screenSizeCheck);
        }
      }, [canRender]);
      return react.createElement("div", {
        className: `responsive-datagrid ${style}`,
        ref: datagridWidgetRef
      }, dataGridWidget);
    }

    exports.ResponsiveDatagridTwo = ResponsiveDatagridTwo;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzcG9uc2l2ZURhdGFncmlkVHdvLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvUmVzcG9uc2l2ZURhdGFncmlkVHdvLmpzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgXCIuL3VpL1Jlc3BvbnNpdmVEYXRhZ3JpZFR3by5jc3NcIjtcbmltcG9ydCB7IGNyZWF0ZUVsZW1lbnQsIHVzZUVmZmVjdCwgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuXG5leHBvcnQgZnVuY3Rpb24gUmVzcG9uc2l2ZURhdGFncmlkVHdvKHtcbiAgICBicmVha3BvaW50cyxcbiAgICBkYXRhR3JpZFdpZGdldCxcbiAgICBEUyxcbiAgICBmb3JjZUF1dG9GaWxsLFxuICAgIGtlZXBMYXN0Qm9vbGVhbixcbiAgICBSZW5kZXJDaGV2cm9uLFxuICAgIC4uLnJlc3Rcbn0pIHtcbiAgICBjb25zdCBzdHlsZSA9IHJlc3QuY2xhc3MgfHwgXCJcIjtcbiAgICBjb25zdCBkYXRhZ3JpZFdpZGdldFJlZiA9IHVzZVJlZihudWxsKTtcbiAgICBjb25zdCBkYXRhZ3JpZFJvd3NSZWYgPSB1c2VSZWYoW10pO1xuICAgIGNvbnN0IFt0YWJsZUNvbnRlbnQsIHNldFRhYmxlQ29udGVudF0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbY2FuUmVuZGVyLCBzZXRDYW5SZW5kZXJdID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IFt0ZW1wbGF0ZUNvbHVtbnMsIHNldFRlbXBsYXRlQ29sdW1uc10gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbc2NyZWVuTW9kZSwgc2V0U2NyZWVuTW9kZV0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbbWF4Q29sdW1ucywgc2V0TWF4Q29sdW1uc10gPSB1c2VTdGF0ZSgxMDApO1xuICAgIGNvbnN0IFt3aWRnZXRMb2FkZWQsIHNldFdpZGdldExvYWRlZF0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3QgY29uZmlnID0ge1xuICAgICAgICAvLyBhdHRyaWJ1dGVzOiB0cnVlLFxuICAgICAgICAvLyBhdHRyaWJ1dGVPbGRWYWx1ZTogdHJ1ZSxcbiAgICAgICAgY2hpbGRMaXN0OiB0cnVlLCAvLyBUaGlzIGlzIGEgbXVzdCBoYXZlIGZvciB0aGUgb2JzZXJ2ZXIgd2l0aCBzdWJ0cmVlXG4gICAgICAgIHN1YnRyZWU6IHRydWUgLy8gU2V0IHRvIHRydWUgaWYgY2hhbmdlcyBtdXN0IGFsc28gYmUgb2JzZXJ2ZWQgaW4gZGVzY2VuZGFudHMuXG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIHNjcmVlblNpemVDaGVjaygpIHtcbiAgICAgICAgY29uc3QgYnJlYWtwb2ludHNNYXAgPSBicmVha3BvaW50cy5yZWR1Y2UoKG1hcCwgYnJlYWtwb2ludCkgPT4ge1xuICAgICAgICAgICAgbWFwW2JyZWFrcG9pbnQuZm9yXSA9IGJyZWFrcG9pbnQ7XG4gICAgICAgICAgICByZXR1cm4gbWFwO1xuICAgICAgICB9LCB7fSk7XG4gICAgICAgIGNvbnN0IHsgbW9iaWxlLCB0YWJsZXQsIGRlc2t0b3AgfSA9IGJyZWFrcG9pbnRzTWFwO1xuICAgICAgICBjb25zdCB3aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuXG4gICAgICAgIGlmIChtb2JpbGUgIT09IHVuZGVmaW5lZCAmJiB3aWR0aCA8PSBtb2JpbGUudmFsdWUpIHtcbiAgICAgICAgICAgIHNldFNjcmVlbk1vZGUoXCJtb2JpbGVcIik7XG4gICAgICAgICAgICBzZXRNYXhDb2x1bW5zKG1vYmlsZS5jb2x1bW5zKTtcbiAgICAgICAgfSBlbHNlIGlmICh0YWJsZXQgIT09IHVuZGVmaW5lZCAmJiB3aWR0aCA8PSB0YWJsZXQudmFsdWUpIHtcbiAgICAgICAgICAgIHNldFNjcmVlbk1vZGUoXCJ0YWJsZXRcIik7XG4gICAgICAgICAgICBzZXRNYXhDb2x1bW5zKHRhYmxldC5jb2x1bW5zKTtcbiAgICAgICAgfSBlbHNlIGlmIChkZXNrdG9wICE9PSB1bmRlZmluZWQgJiYgd2lkdGggPD0gZGVza3RvcC52YWx1ZSkge1xuICAgICAgICAgICAgc2V0U2NyZWVuTW9kZShcImRlc2t0b3BcIik7XG4gICAgICAgICAgICBzZXRNYXhDb2x1bW5zKGRlc2t0b3AuY29sdW1ucyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZXRTY3JlZW5Nb2RlKFwibGFyZ2UtZGVza3RvcFwiKTtcbiAgICAgICAgICAgIHNldE1heENvbHVtbnMoMTAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNldEdyaWRDb2x1bW5zKCkge1xuICAgICAgICBjb25zdCBjb2x1bW5BcnJheSA9IHRlbXBsYXRlQ29sdW1ucy5yZXBsYWNlKFwiZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiBcIiwgXCJcIikuc3BsaXQoLyAoPyFbXigpXSpcXCkpLyk7XG4gICAgICAgIGNvbnN0IG1heENvbHVtbkFycmF5ID0gY29sdW1uQXJyYXkuc2xpY2UoXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgY29sdW1uQXJyYXkubGVuZ3RoIC0gKGNvbHVtbkFycmF5Lmxlbmd0aCAtIG1heENvbHVtbnMpICsgKGtlZXBMYXN0Qm9vbGVhbiA/IC0xIDogMClcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAoa2VlcExhc3RCb29sZWFuKSB7XG4gICAgICAgICAgICBtYXhDb2x1bW5BcnJheS5wdXNoKFwiZml0LWNvbnRlbnQoMTAwJSlcIik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoUmVuZGVyQ2hldnJvbiA9PT0gXCJyaWdodFwiKSB7XG4gICAgICAgICAgICBtYXhDb2x1bW5BcnJheS5wdXNoKFwiZml0LWNvbnRlbnQoMTAwJSlcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtYXhDb2x1bW5BcnJheS51bnNoaWZ0KFwiZml0LWNvbnRlbnQoMTAwJSlcIik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZm9yY2VBdXRvRmlsbCkge1xuICAgICAgICAgICAgbWF4Q29sdW1uQXJyYXkuc3BsaWNlKDIsIDEsIFwiMWZyXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGFibGVDb250ZW50LnNldEF0dHJpYnV0ZShcInN0eWxlXCIsIGBncmlkLXRlbXBsYXRlLWNvbHVtbnM6ICR7bWF4Q29sdW1uQXJyYXkuam9pbihcIiBcIikucmVwbGFjZShcIjtcIiwgXCJcIil9O2ApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRvZ2dsZVRyQ29sbGFwc2UoZXZlbnQsIGNoZXZyb25CdG4pIHtcbiAgICAgICAgY29uc3Qgbm90Q29sbGFwc2VkID0gW1xuICAgICAgICAgICAgLi4uZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi50ci1yZXNwLWNvbGxhcHNpYmxlOm5vdCgudHItcmVzcC1jb2xsYXBzaWJsZS0tY29sbGFwc2VkKVwiKVxuICAgICAgICBdO1xuICAgICAgICBpZiAobm90Q29sbGFwc2VkLmxlbmd0aCkge1xuICAgICAgICAgICAgbm90Q29sbGFwc2VkLmZvckVhY2goY2hldnJvblJvdyA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgcm93QnRuID0gY2hldnJvblJvdy5wYXJlbnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuYnRuLXRkLXJlc3AtY29sbGFwc2VcIik7XG4gICAgICAgICAgICAgICAgaWYgKHJvd0J0biAhPT0gY2hldnJvbkJ0bikge1xuICAgICAgICAgICAgICAgICAgICBjaGV2cm9uUm93LmNsYXNzTGlzdC50b2dnbGUoXCJ0ci1yZXNwLWNvbGxhcHNpYmxlLS1jb2xsYXBzZWRcIik7XG4gICAgICAgICAgICAgICAgICAgIGNoZXZyb25Sb3cucGFyZW50RWxlbWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgLnF1ZXJ5U2VsZWN0b3IoXCIuYnRuLXRkLXJlc3AtY29sbGFwc2VcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jbGFzc0xpc3QudG9nZ2xlKFwiYnRuLXRkLXJlc3AtY29sbGFwc2UtLWFjdGl2ZVwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNoZXZyb25CdG4uY2xhc3NMaXN0LnRvZ2dsZShcImJ0bi10ZC1yZXNwLWNvbGxhcHNlLS1hY3RpdmVcIik7XG4gICAgICAgIGV2ZW50LnRhcmdldFxuICAgICAgICAgICAgLmNsb3Nlc3QoXCIudHJcIilcbiAgICAgICAgICAgIC5xdWVyeVNlbGVjdG9yKFwiLnRyLXJlc3AtY29sbGFwc2libGVcIilcbiAgICAgICAgICAgIC5jbGFzc0xpc3QudG9nZ2xlKFwidHItcmVzcC1jb2xsYXBzaWJsZS0tY29sbGFwc2VkXCIpO1xuICAgIH1cblxuICAgIC8vIENoZWNrIHRoZSBjb2x1bW4gdG8gaW5zZXJ0IHRoZSBjaGV2cm9uXG4gICAgZnVuY3Rpb24gcmVuZGVyQ2hldnJvbihyb3cpIHtcbiAgICAgICAgLy8gQ2hlY2sgZmlyc3QgVEggaWYgdGhlcmUgaXMgbm8gY2hldnJvbiBwcmVzZW50XG4gICAgICAgIGlmICghcm93LnF1ZXJ5U2VsZWN0b3IoXCIudGguY2hldnJvbi10aFwiKSkge1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0VEggPVxuICAgICAgICAgICAgICAgIFJlbmRlckNoZXZyb24gPT09IFwibGVmdFwiXG4gICAgICAgICAgICAgICAgICAgID8gcm93LnF1ZXJ5U2VsZWN0b3IoXCIudGhcIilcbiAgICAgICAgICAgICAgICAgICAgOiByb3cucXVlcnlTZWxlY3RvcihgLnRoOm50aC1jaGlsZCgke21heENvbHVtbnMgKyAxfSlgKTtcbiAgICAgICAgICAgIGNvbnN0IGV4dHJhVEggPSBgPGRpdiBjbGFzcz1cInRoIGNoZXZyb24tdGhcIiByb2xlPVwiY29sdW1uaGVhZGVyXCI+PGRpdiBjbGFzcz1cImNvbHVtbi1jb250YWluZXJcIj4mbmJzcDs8L2Rpdj48L2Rpdj5gO1xuICAgICAgICAgICAgaWYgKHNlbGVjdFRIICYmIHNlbGVjdFRILnF1ZXJ5U2VsZWN0b3IoXCIudGQtY3VzdG9tLWNvbnRlbnRcIikgJiYgUmVuZGVyQ2hldnJvbiA9PT0gXCJsZWZ0XCIpIHtcbiAgICAgICAgICAgICAgICBzZWxlY3RUSC5pbnNlcnRBZGphY2VudEhUTUwoXCJhZnRlcmVuZFwiLCBleHRyYVRIKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc2VsZWN0VEgpIHtcbiAgICAgICAgICAgICAgICBzZWxlY3RUSC5pbnNlcnRBZGphY2VudEhUTUwoXCJiZWZvcmViZWdpblwiLCBleHRyYVRIKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENoZWNrIGZpcnN0IFREIGlmIHRoZXJlIGlzIG5vIGNoZXZyb24gcHJlc2VudFxuICAgICAgICBpZiAoIXJvdy5xdWVyeVNlbGVjdG9yKFwiLnRkLmNoZXZyb24tdGRcIikpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdFREID1cbiAgICAgICAgICAgICAgICBSZW5kZXJDaGV2cm9uID09PSBcImxlZnRcIlxuICAgICAgICAgICAgICAgICAgICA/IHJvdy5xdWVyeVNlbGVjdG9yKFwiLnRkXCIpXG4gICAgICAgICAgICAgICAgICAgIDogcm93LnF1ZXJ5U2VsZWN0b3IoYC50ZDpudGgtY2hpbGQoJHttYXhDb2x1bW5zICsgMX0pYCk7XG4gICAgICAgICAgICBjb25zdCBib3JkZXJDbGFzcyA9IHJvdy5xdWVyeVNlbGVjdG9yKFwiLnRkLWJvcmRlcnNcIikgPyBcInRkLWJvcmRlcnMgXCIgOiBcIlwiO1xuICAgICAgICAgICAgY29uc3QgY2xpY2thYmxlQ2xhc3MgPSByb3cucXVlcnlTZWxlY3RvcihcIi50ZC5jbGlja2FibGVcIikgPyBcImNsaWNrYWJsZVwiIDogXCJcIjtcbiAgICAgICAgICAgIGNvbnN0IGV4dHJhVEQgPSBgPGRpdiBjbGFzcz1cInRkIGNoZXZyb24tdGQgYnRuLXRkLXJlc3AtY29sbGFwc2UgJHtib3JkZXJDbGFzc30ke2NsaWNrYWJsZUNsYXNzfVwiIHJvbGU9XCJncmlkY2VsbFwiPjxkaXYgY2xhc3M9XCJ0ZC1jdXN0b20tY29udGVudFwiPjxzdmcgaGVpZ2h0PVwiMTZcIiB3aWR0aD1cIjE2XCIgdmlld0JveD1cIjAgMCAxNiAxNlwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiBmaWxsPVwiY3VycmVudENvbG9yXCI+PHBhdGggZD1cIk04LjAwMDA0IDExLjEzNjlDOC4yMTAzMyAxMS4xMzY5IDguMzg3NDEgMTEuMDUzOSA4LjU0Nzg5IDEwLjg5MzRMMTIuNDkzNSA2Ljg1MzY4QzEyLjYyMDggNi43MjA4NyAxMi42ODcyIDYuNTY1OTIgMTIuNjg3MiA2LjM3Nzc3QzEyLjY4NzIgNS45OTA0IDEyLjM4MjkgNS42ODYwNCAxMi4wMDY2IDUuNjg2MDRDMTEuODIzOSA1LjY4NjA0IDExLjY0NjkgNS43NjM1MSAxMS41MDg1IDUuOTAxODZMOC4wMDU1NyA5LjUwNDM5TDQuNDkxNTggNS45MDE4NkM0LjM1ODc2IDUuNzY5MDQgNC4xODcyMiA1LjY4NjA0IDMuOTkzNTMgNS42ODYwNEMzLjYxNzIzIDUuNjg2MDQgMy4zMTI4NyA1Ljk5MDQgMy4zMTI4NyA2LjM3Nzc3QzMuMzEyODcgNi41NjAzOCAzLjM4NDgxIDYuNzIwODcgMy41MTIwOCA2Ljg1MzY4TDcuNDU3NzIgMTAuODkzNEM3LjYyMzc0IDExLjA1OTQgNy43OTUyOSAxMS4xMzY5IDguMDAwMDQgMTEuMTM2OVpcIi8+PC9zdmc+PC9kaXY+PC9kaXY+YDtcbiAgICAgICAgICAgIGlmIChzZWxlY3RURCAmJiBzZWxlY3RURC5xdWVyeVNlbGVjdG9yKFwiLnRkLWN1c3RvbS1jb250ZW50XCIpICYmIFJlbmRlckNoZXZyb24gPT09IFwibGVmdFwiKSB7XG4gICAgICAgICAgICAgICAgc2VsZWN0VEQuaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYWZ0ZXJlbmRcIiwgZXh0cmFURCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHNlbGVjdFREKSB7XG4gICAgICAgICAgICAgICAgc2VsZWN0VEQuaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYmVmb3JlYmVnaW5cIiwgZXh0cmFURCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZW5kZXJDb2xsYXBzaWJsZURpdihyb3cpIHtcbiAgICAgICAgY29uc3QgY29sbGFwc2libGVEaXYgPSBgPGRpdiBjbGFzcz1cInRyLXJlc3AtY29sbGFwc2libGUgdHItcmVzcC1jb2xsYXBzaWJsZS0tY29sbGFwc2VkXCI+PC9kaXY+YDtcbiAgICAgICAgaWYgKCFyb3cucXVlcnlTZWxlY3RvcihcIi50ci1yZXNwLWNvbGxhcHNpYmxlXCIpKSB7XG4gICAgICAgICAgICByb3cuaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYmVmb3JlZW5kXCIsIGNvbGxhcHNpYmxlRGl2KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1vdmVDb2x1bW5zSW5zaWRlQ29sbGFwc2libGVEaXYocm93KSB7XG4gICAgICAgIGNvbnN0IGVuZEluZGV4ID0ga2VlcExhc3RCb29sZWFuID8gLTEgOiAwO1xuICAgICAgICBjb25zdCBUSHMgPSBbLi4ucm93LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGhcIildO1xuXG4gICAgICAgIGlmIChUSHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zdCBzdGFydEluZGV4ID0gVEhzLmxlbmd0aCAtIChUSHMubGVuZ3RoIC0gbWF4Q29sdW1ucykgKyAoa2VlcExhc3RCb29sZWFuID8gLTEgOiAwKTtcblxuICAgICAgICAgICAgaWYgKGtlZXBMYXN0Qm9vbGVhbikge1xuICAgICAgICAgICAgICAgIFRIcy5zbGljZShzdGFydEluZGV4LCBlbmRJbmRleCkuZm9yRWFjaChUSCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIFRILmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIFRIcy5zbGljZShzdGFydEluZGV4KS5mb3JFYWNoKFRIID0+IHtcbiAgICAgICAgICAgICAgICAgICAgVEguY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IFREcyA9IFsuLi5yb3cucXVlcnlTZWxlY3RvckFsbChcIi50ZFwiKV07XG4gICAgICAgIGlmIChURHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zdCBzdGFydEluZGV4ID0gVERzLmxlbmd0aCAtIChURHMubGVuZ3RoIC0gbWF4Q29sdW1ucykgKyAoa2VlcExhc3RCb29sZWFuID8gLTEgOiAwKTtcblxuICAgICAgICAgICAgaWYgKGtlZXBMYXN0Qm9vbGVhbikge1xuICAgICAgICAgICAgICAgIFREcy5zbGljZShzdGFydEluZGV4LCBlbmRJbmRleCkuZm9yRWFjaCgoVEQsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIFRELmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhlYWRlcnMgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5kYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJy53aWRnZXQtZGF0YWdyaWQgLnRyW3JvbGU9XCJyb3dcIl06Zmlyc3QtY2hpbGQgLnRoLmhpZGRlbidcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sbGFwc2libGUgPSByb3cucXVlcnlTZWxlY3RvcihcIi50ci1yZXNwLWNvbGxhcHNpYmxlXCIpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb2xsYXBzaWJsZUNvbnRlbnQgPSBgPGRpdiBjbGFzcz1cInRyLXJlc3AtY29sbGFwc2libGVfX2l0ZW1cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwidGQtdGV4dCB0ZXh0LWJvbGQgbm9tYXJnaW5cIj4ke2hlYWRlcnNbaW5kZXhdPy5xdWVyeVNlbGVjdG9yKFwic3BhblwiKS5pbm5lckhUTUx9PC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidGQtdGV4dFwiPiR7VEQucXVlcnlTZWxlY3RvcihcInNwYW5cIik/LmlubmVySFRNTH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5gO1xuICAgICAgICAgICAgICAgICAgICBjb2xsYXBzaWJsZS5pbnNlcnRBZGphY2VudEhUTUwoXCJiZWZvcmVlbmRcIiwgY29sbGFwc2libGVDb250ZW50KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgVERzLnNsaWNlKHN0YXJ0SW5kZXgpLmZvckVhY2goKFRELCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBURC5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBoZWFkZXJzID0gW1xuICAgICAgICAgICAgICAgICAgICAgICAgLi4uZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcud2lkZ2V0LWRhdGFncmlkIC50cltyb2xlPVwicm93XCJdOmZpcnN0LWNoaWxkIC50aC5oaWRkZW4nXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbGxhcHNpYmxlID0gcm93LnF1ZXJ5U2VsZWN0b3IoXCIudHItcmVzcC1jb2xsYXBzaWJsZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sbGFwc2libGVDb250ZW50ID0gYDxkaXYgY2xhc3M9XCJ0ci1yZXNwLWNvbGxhcHNpYmxlX19pdGVtXCI+XG4gICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwidGQtdGV4dCB0ZXh0LWJvbGQgbm9tYXJnaW5cIj4ke2hlYWRlcnNbaW5kZXhdPy5xdWVyeVNlbGVjdG9yKFwic3BhblwiKS5pbm5lckhUTUx9PC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0ZC10ZXh0XCI+JHtURC5xdWVyeVNlbGVjdG9yKFwic3BhblwiKT8uaW5uZXJIVE1MfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+YDtcbiAgICAgICAgICAgICAgICAgICAgY29sbGFwc2libGUuaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYmVmb3JlZW5kXCIsIGNvbGxhcHNpYmxlQ29udGVudCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZW5kZXJFbGVtZW50cygpIHtcbiAgICAgICAgLy8gUHJvY2VzcyBlYWNoIHJvd1xuICAgICAgICBkYXRhZ3JpZFJvd3NSZWYuY3VycmVudC5mb3JFYWNoKHJvdyA9PiB7XG4gICAgICAgICAgICByZW5kZXJDb2xsYXBzaWJsZURpdihyb3cpO1xuICAgICAgICAgICAgbW92ZUNvbHVtbnNJbnNpZGVDb2xsYXBzaWJsZURpdihyb3cpO1xuICAgICAgICAgICAgcmVuZGVyQ2hldnJvbihyb3cpO1xuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBjaGV2cm9uQnRucyA9IFsuLi5kYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuYnRuLXRkLXJlc3AtY29sbGFwc2VcIildO1xuICAgICAgICBjaGV2cm9uQnRucy5mb3JFYWNoKGNoZXZyb25CdG4gPT5cbiAgICAgICAgICAgIGNoZXZyb25CdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGV2ZW50ID0+IHRvZ2dsZVRyQ29sbGFwc2UoZXZlbnQsIGNoZXZyb25CdG4pKVxuICAgICAgICApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlc2V0Q29sbGFwc2libGVzKCkge1xuICAgICAgICBjb25zdCBhbGxDb2xsYXBzaWJsZXMgPSBbLi4uZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudD8ucXVlcnlTZWxlY3RvckFsbChcIi50ci1yZXNwLWNvbGxhcHNpYmxlXCIpXTtcbiAgICAgICAgYWxsQ29sbGFwc2libGVzLmZvckVhY2goY29sbGFwc2libGUgPT4gY29sbGFwc2libGUucmVtb3ZlKCkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlc2V0SGlkZGVuQ29sdW1ucygpIHtcbiAgICAgICAgY29uc3QgaGlkZGVuQ29sdW1ucyA9IFsuLi5kYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50Py5xdWVyeVNlbGVjdG9yQWxsKFwiLnRoLmhpZGRlbiwgLnRkLmhpZGRlblwiKV07XG4gICAgICAgIGhpZGRlbkNvbHVtbnMuZm9yRWFjaChoaWRkZW5Db2x1bW4gPT4gaGlkZGVuQ29sdW1uLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIikpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlc2V0Q2hldnJvbnMoKSB7XG4gICAgICAgIGNvbnN0IHJvd3MgPSBbLi4uZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudC5xdWVyeVNlbGVjdG9yQWxsKCcudHJbcm9sZT1cInJvd1wiXScpXTtcbiAgICAgICAgcm93cy5mb3JFYWNoKHJvdyA9PiB7XG4gICAgICAgICAgICByb3cucXVlcnlTZWxlY3RvcihcIi50aC5jaGV2cm9uLXRoXCIpPy5yZW1vdmUoKTtcbiAgICAgICAgICAgIHJvdy5xdWVyeVNlbGVjdG9yKFwiLnRkLmNoZXZyb24tdGRcIik/LnJlbW92ZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvblNvcnQoKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgcmVzZXRDb2xsYXBzaWJsZXMoKTtcbiAgICAgICAgICAgIHJlc2V0SGlkZGVuQ29sdW1ucygpO1xuICAgICAgICAgICAgcmVzZXRDaGV2cm9ucygpO1xuICAgICAgICAgICAgcmVuZGVyRWxlbWVudHMoKTtcbiAgICAgICAgfSwgMTAwKTtcbiAgICB9XG5cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBpZiAoY2FuUmVuZGVyICYmIHNjcmVlbk1vZGUgJiYgZGF0YWdyaWRSb3dzUmVmLmN1cnJlbnQubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zdCBoZWFkZXJzID0gWy4uLmRhdGFncmlkUm93c1JlZi5jdXJyZW50WzBdLnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGhcIildO1xuXG4gICAgICAgICAgICAvLyBGb3IgZGVza3RvcCBsZWF2ZSAvIHJlc3RvcmUgZGVmYXVsdC4gRm9yIG90aGVyIHNpdHVhdGlvbnMgdXBkYXRlIHRvIG1vYmlsZSAvIHRhYmxldCBjb2x1bW5zXG4gICAgICAgICAgICBpZiAoc2NyZWVuTW9kZSA9PT0gXCJsYXJnZS1kZXNrdG9wXCIpIHtcbiAgICAgICAgICAgICAgICB0YWJsZUNvbnRlbnQ/LnNldEF0dHJpYnV0ZShcInN0eWxlXCIsIHRlbXBsYXRlQ29sdW1ucyk7XG4gICAgICAgICAgICAgICAgcmVzZXRDb2xsYXBzaWJsZXMoKTtcbiAgICAgICAgICAgICAgICByZXNldEhpZGRlbkNvbHVtbnMoKTtcbiAgICAgICAgICAgICAgICByZXNldENoZXZyb25zKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNldEdyaWRDb2x1bW5zKCk7XG4gICAgICAgICAgICAgICAgcmVzZXRDb2xsYXBzaWJsZXMoKTtcbiAgICAgICAgICAgICAgICByZXNldEhpZGRlbkNvbHVtbnMoKTtcbiAgICAgICAgICAgICAgICByZXNldENoZXZyb25zKCk7XG4gICAgICAgICAgICAgICAgcmVuZGVyRWxlbWVudHMoKTtcbiAgICAgICAgICAgICAgICBoZWFkZXJzLmZvckVhY2goaGVhZGVyID0+IGhlYWRlci5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgb25Tb3J0KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEZXRlY3QgYSBjaGFuZ2UgaW4gRGF0YSBncmlkIDIgYWZ0ZXIgdGhlIGluaXRpYWwgcmVuZGVyaW5nIG9mIGV2ZXJ5dGhpbmdcbiAgICAgICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigoKSA9PiB7XG4gICAgICAgICAgICBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICBpZiAoZGF0YWdyaWRSb3dzUmVmLmN1cnJlbnQgIT09IGRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQucXVlcnlTZWxlY3RvckFsbChcIi50cltyb2xlPXJvd11cIikpIHtcbiAgICAgICAgICAgICAgICBkYXRhZ3JpZFJvd3NSZWYuY3VycmVudCA9IFsuLi5kYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudHJbcm9sZT1yb3ddXCIpXTtcbiAgICAgICAgICAgICAgICBpZiAoc2NyZWVuTW9kZSAhPT0gXCJsYXJnZS1kZXNrdG9wXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzZXRDb2xsYXBzaWJsZXMoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzZXRIaWRkZW5Db2x1bW5zKCk7XG4gICAgICAgICAgICAgICAgICAgIHJlc2V0Q2hldnJvbnMoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyRWxlbWVudHMoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG9ic2VydmVyLm9ic2VydmUoZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudCwgY29uZmlnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGRhdGFncmlkV2lkZ2V0UmVmICYmIGRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIG9ic2VydmVyLm9ic2VydmUoZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudCwgY29uZmlnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoKSA9PiBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgfSk7XG5cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBpZiAoRFMgJiYgRFMuc3RhdHVzID09PSBcImF2YWlsYWJsZVwiICYmIHdpZGdldExvYWRlZCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgaWYgKGRhdGFncmlkUm93c1JlZi5jdXJyZW50ICE9PSBkYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudHJbcm9sZT1yb3ddXCIpKSB7XG4gICAgICAgICAgICAgICAgZGF0YWdyaWRSb3dzUmVmLmN1cnJlbnQgPSBbLi4uZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnRyW3JvbGU9cm93XVwiKV07XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzY3JlZW5Nb2RlICE9PSBcImxhcmdlLWRlc2t0b3BcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzZXRDb2xsYXBzaWJsZXMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc2V0SGlkZGVuQ29sdW1ucygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzZXRDaGV2cm9ucygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyRWxlbWVudHMoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIDIwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgaWYgKGRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICBzZXRUYWJsZUNvbnRlbnQoZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudC5xdWVyeVNlbGVjdG9yKFwiLndpZGdldC1kYXRhZ3JpZCAud2lkZ2V0LWRhdGFncmlkLWdyaWQtYm9keVwiKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQsIGNvbmZpZyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChkYXRhZ3JpZFdpZGdldFJlZiAmJiBkYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQsIGNvbmZpZyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKCkgPT4gb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgIH0sIFtdKTtcblxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGlmICh0YWJsZUNvbnRlbnQpIHtcbiAgICAgICAgICAgIHNldFRlbXBsYXRlQ29sdW1ucyh0YWJsZUNvbnRlbnQuZ2V0QXR0cmlidXRlKFwic3R5bGVcIikpO1xuICAgICAgICAgICAgc2NyZWVuU2l6ZUNoZWNrKCk7XG4gICAgICAgICAgICBzZXRDYW5SZW5kZXIodHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9LCBbdGFibGVDb250ZW50XSk7XG5cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBpZiAoY2FuUmVuZGVyKSB7XG4gICAgICAgICAgICBzY3JlZW5TaXplQ2hlY2soKTtcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHNjcmVlblNpemVDaGVjayk7XG4gICAgICAgICAgICBzZXRXaWRnZXRMb2FkZWQodHJ1ZSk7XG4gICAgICAgICAgICByZXR1cm4gKCkgPT4gd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgc2NyZWVuU2l6ZUNoZWNrKTtcbiAgICAgICAgfVxuICAgIH0sIFtjYW5SZW5kZXJdKTtcblxuICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgcmVzcG9uc2l2ZS1kYXRhZ3JpZCAke3N0eWxlfWB9IHJlZj17ZGF0YWdyaWRXaWRnZXRSZWZ9PlxuICAgICAgICAgICAge2RhdGFHcmlkV2lkZ2V0fVxuICAgICAgICA8L2Rpdj5cbiAgICApO1xufVxuIl0sIm5hbWVzIjpbIlJlc3BvbnNpdmVEYXRhZ3JpZFR3byIsImJyZWFrcG9pbnRzIiwiZGF0YUdyaWRXaWRnZXQiLCJEUyIsImZvcmNlQXV0b0ZpbGwiLCJrZWVwTGFzdEJvb2xlYW4iLCJSZW5kZXJDaGV2cm9uIiwicmVzdCIsInN0eWxlIiwiY2xhc3MiLCJkYXRhZ3JpZFdpZGdldFJlZiIsInVzZVJlZiIsImRhdGFncmlkUm93c1JlZiIsInRhYmxlQ29udGVudCIsInNldFRhYmxlQ29udGVudCIsInVzZVN0YXRlIiwiY2FuUmVuZGVyIiwic2V0Q2FuUmVuZGVyIiwidGVtcGxhdGVDb2x1bW5zIiwic2V0VGVtcGxhdGVDb2x1bW5zIiwic2NyZWVuTW9kZSIsInNldFNjcmVlbk1vZGUiLCJtYXhDb2x1bW5zIiwic2V0TWF4Q29sdW1ucyIsIndpZGdldExvYWRlZCIsInNldFdpZGdldExvYWRlZCIsImNvbmZpZyIsImNoaWxkTGlzdCIsInN1YnRyZWUiLCJzY3JlZW5TaXplQ2hlY2siLCJicmVha3BvaW50c01hcCIsInJlZHVjZSIsIm1hcCIsImJyZWFrcG9pbnQiLCJmb3IiLCJtb2JpbGUiLCJ0YWJsZXQiLCJkZXNrdG9wIiwid2lkdGgiLCJ3aW5kb3ciLCJpbm5lcldpZHRoIiwidW5kZWZpbmVkIiwidmFsdWUiLCJjb2x1bW5zIiwic2V0R3JpZENvbHVtbnMiLCJjb2x1bW5BcnJheSIsInJlcGxhY2UiLCJzcGxpdCIsIm1heENvbHVtbkFycmF5Iiwic2xpY2UiLCJsZW5ndGgiLCJwdXNoIiwidW5zaGlmdCIsInNwbGljZSIsInNldEF0dHJpYnV0ZSIsImpvaW4iLCJ0b2dnbGVUckNvbGxhcHNlIiwiZXZlbnQiLCJjaGV2cm9uQnRuIiwibm90Q29sbGFwc2VkIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yQWxsIiwiZm9yRWFjaCIsImNoZXZyb25Sb3ciLCJyb3dCdG4iLCJwYXJlbnRFbGVtZW50IiwicXVlcnlTZWxlY3RvciIsImNsYXNzTGlzdCIsInRvZ2dsZSIsInRhcmdldCIsImNsb3Nlc3QiLCJyZW5kZXJDaGV2cm9uIiwicm93Iiwic2VsZWN0VEgiLCJleHRyYVRIIiwiaW5zZXJ0QWRqYWNlbnRIVE1MIiwic2VsZWN0VEQiLCJib3JkZXJDbGFzcyIsImNsaWNrYWJsZUNsYXNzIiwiZXh0cmFURCIsInJlbmRlckNvbGxhcHNpYmxlRGl2IiwiY29sbGFwc2libGVEaXYiLCJtb3ZlQ29sdW1uc0luc2lkZUNvbGxhcHNpYmxlRGl2IiwiZW5kSW5kZXgiLCJUSHMiLCJzdGFydEluZGV4IiwiVEgiLCJhZGQiLCJURHMiLCJURCIsImluZGV4IiwiaGVhZGVycyIsImN1cnJlbnQiLCJjb2xsYXBzaWJsZSIsImNvbGxhcHNpYmxlQ29udGVudCIsImlubmVySFRNTCIsInJlbmRlckVsZW1lbnRzIiwiY2hldnJvbkJ0bnMiLCJhZGRFdmVudExpc3RlbmVyIiwicmVzZXRDb2xsYXBzaWJsZXMiLCJhbGxDb2xsYXBzaWJsZXMiLCJyZW1vdmUiLCJyZXNldEhpZGRlbkNvbHVtbnMiLCJoaWRkZW5Db2x1bW5zIiwiaGlkZGVuQ29sdW1uIiwicmVzZXRDaGV2cm9ucyIsInJvd3MiLCJvblNvcnQiLCJzZXRUaW1lb3V0IiwidXNlRWZmZWN0IiwiaGVhZGVyIiwib2JzZXJ2ZXIiLCJNdXRhdGlvbk9ic2VydmVyIiwiZGlzY29ubmVjdCIsIm9ic2VydmUiLCJzdGF0dXMiLCJnZXRBdHRyaWJ1dGUiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiY3JlYXRlRWxlbWVudCIsImNsYXNzTmFtZSIsInJlZiJdLCJtYXBwaW5ncyI6Ijs7SUFHTyxTQUFTQSxx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
