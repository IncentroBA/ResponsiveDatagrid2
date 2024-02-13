define(['exports', 'react'], (function (exports, react) { 'use strict';

    function ResponsiveDatagridTwo({
      dataGridWidget,
      desktopBreakpoint,
      keepLastBoolean,
      maxColumnsMobile,
      maxColumnsTablet,
      mobileBreakpoint,
      ...rest
    }) {
      const style = rest.class || "";
      const datagridWidgetRef = react.useRef(null);
      const datagridRowsRef = react.useRef([]);
      const [tableContent, setTableContent] = react.useState(null);
      const [canRender, setCanRender] = react.useState(false);
      const [templateColumns, setTemplateColumns] = react.useState(null);
      const [screenMode, setSceenMode] = react.useState(null);
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
      react.useEffect(() => {
        function setGridColumns() {
          const offset = keepLastBoolean ? -1 : 0;
          const columnArray = templateColumns.replace("grid-template-columns: ", "").split(/ (?![^()]*\))/); // Regex for space when not inside ()
          const visibleColumns = screenMode === "mobile" ? maxColumnsMobile : maxColumnsTablet;
          const maxColumnArray = columnArray.slice(columnArray.length - visibleColumns - offset); // remove all but the last maxColumnsMobile

          if (offset) {
            maxColumnArray.push("fit-content(100%)");
          }
          maxColumnArray.join(" ").replace(";", "");
          maxColumnArray.unshift("fit-content(100%)"); // add new column for the chevron
          maxColumnArray.splice(2, 1, "1fr"); // convert at least one auto-fill column to auto-fill
          tableContent.setAttribute("style", `grid-template-columns: ${maxColumnArray.join(" ").replace(";", "")};`);
        }
        function toggleTrCollapse(event, chevronBtn) {
          console.info("toggleTrCollapse");
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
            const selectTH = row.querySelector(".th");
            const extraTH = `<div class="th chevron-th" role="columnheader"><div class="column-container">&nbsp;</div></div>`;
            if (selectTH && selectTH.querySelector(".td-custom-content")) {
              selectTH.insertAdjacentHTML("afterend", extraTH);
            } else if (selectTH) {
              selectTH.insertAdjacentHTML("beforebegin", extraTH);
            }
          }

          // Check first TD if there is no chevron present
          if (!row.querySelector(".td.chevron-td")) {
            const selectTD = row.querySelector(".td");
            const borderClass = row.querySelector(".td-borders") ? "td-borders " : "";
            const extraTD = `<div class="td ${borderClass}chevron-td btn-td-resp-collapse" role="gridcell"><div class="td-custom-content"><svg height="16" width="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M8.00004 11.1369C8.21033 11.1369 8.38741 11.0539 8.54789 10.8934L12.4935 6.85368C12.6208 6.72087 12.6872 6.56592 12.6872 6.37777C12.6872 5.9904 12.3829 5.68604 12.0066 5.68604C11.8239 5.68604 11.6469 5.76351 11.5085 5.90186L8.00557 9.50439L4.49158 5.90186C4.35876 5.76904 4.18722 5.68604 3.99353 5.68604C3.61723 5.68604 3.31287 5.9904 3.31287 6.37777C3.31287 6.56038 3.38481 6.72087 3.51208 6.85368L7.45772 10.8934C7.62374 11.0594 7.79529 11.1369 8.00004 11.1369Z"/></svg></div></div>`;
            if (selectTD && selectTD.querySelector(".td-custom-content")) {
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
          const offset = keepLastBoolean ? -1 : 0;
          const visibleColumns = screenMode === "mobile" ? maxColumnsMobile : maxColumnsTablet;
          const THs = [...row.querySelectorAll(".th")];
          if (THs.length) {
            THs.slice(THs.length - (THs.length - visibleColumns) + offset, offset).forEach(TH => {
              TH.classList.add("hidden");
            });
          }
          const TDs = [...row.querySelectorAll(".td")];
          if (TDs.length) {
            TDs.slice(TDs.length - (TDs.length - visibleColumns) + offset, offset).forEach((TD, index) => {
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
            console.info("onSort", screenMode);
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
        if (screenMode !== "desktop") {
          // Detect a change in Data grid 2 after the initial rendering of everything
          const observer = new MutationObserver(() => {
            observer.disconnect();
            if (datagridRowsRef.current !== datagridWidgetRef.current.querySelectorAll(".tr[role=row]")) {
              datagridRowsRef.current = [...datagridWidgetRef.current.querySelectorAll(".tr[role=row]")];
              resetCollapsibles();
              resetHiddenColumns();
              resetChevrons();
              renderElements();
            }
            observer.observe(datagridWidgetRef.current, config);
          });
          if (datagridWidgetRef && datagridWidgetRef.current) {
            observer.observe(datagridWidgetRef.current, config);
          }
          return () => observer.disconnect();
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
      });
      react.useEffect(() => {
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
      return react.createElement("div", {
        className: `responsive-datagrid ${style}`,
        ref: datagridWidgetRef
      }, dataGridWidget);
    }

    exports.ResponsiveDatagridTwo = ResponsiveDatagridTwo;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzcG9uc2l2ZURhdGFncmlkVHdvLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvUmVzcG9uc2l2ZURhdGFncmlkVHdvLmpzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgXCIuL3VpL1Jlc3BvbnNpdmVEYXRhZ3JpZFR3by5jc3NcIjtcbmltcG9ydCB7IGNyZWF0ZUVsZW1lbnQsIHVzZUVmZmVjdCwgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuXG5leHBvcnQgZnVuY3Rpb24gUmVzcG9uc2l2ZURhdGFncmlkVHdvKHtcbiAgICBkYXRhR3JpZFdpZGdldCxcbiAgICBkZXNrdG9wQnJlYWtwb2ludCxcbiAgICBrZWVwTGFzdEJvb2xlYW4sXG4gICAgbWF4Q29sdW1uc01vYmlsZSxcbiAgICBtYXhDb2x1bW5zVGFibGV0LFxuICAgIG1vYmlsZUJyZWFrcG9pbnQsXG4gICAgLi4ucmVzdFxufSkge1xuICAgIGNvbnN0IHN0eWxlID0gcmVzdC5jbGFzcyB8fCBcIlwiO1xuICAgIGNvbnN0IGRhdGFncmlkV2lkZ2V0UmVmID0gdXNlUmVmKG51bGwpO1xuICAgIGNvbnN0IGRhdGFncmlkUm93c1JlZiA9IHVzZVJlZihbXSk7XG4gICAgY29uc3QgW3RhYmxlQ29udGVudCwgc2V0VGFibGVDb250ZW50XSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtjYW5SZW5kZXIsIHNldENhblJlbmRlcl0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3QgW3RlbXBsYXRlQ29sdW1ucywgc2V0VGVtcGxhdGVDb2x1bW5zXSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtzY3JlZW5Nb2RlLCBzZXRTY2Vlbk1vZGVdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgY29uZmlnID0ge1xuICAgICAgICAvLyBhdHRyaWJ1dGVzOiB0cnVlLFxuICAgICAgICAvLyBhdHRyaWJ1dGVPbGRWYWx1ZTogdHJ1ZSxcbiAgICAgICAgY2hpbGRMaXN0OiB0cnVlLCAvLyBUaGlzIGlzIGEgbXVzdCBoYXZlIGZvciB0aGUgb2JzZXJ2ZXIgd2l0aCBzdWJ0cmVlXG4gICAgICAgIHN1YnRyZWU6IHRydWUgLy8gU2V0IHRvIHRydWUgaWYgY2hhbmdlcyBtdXN0IGFsc28gYmUgb2JzZXJ2ZWQgaW4gZGVzY2VuZGFudHMuXG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIHNjcmVlblNpemVDaGVjaygpIHtcbiAgICAgICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoIDw9IG1vYmlsZUJyZWFrcG9pbnQpIHtcbiAgICAgICAgICAgIGlmIChzY3JlZW5Nb2RlICE9PSBcIm1vYmlsZVwiKSB7XG4gICAgICAgICAgICAgICAgc2V0U2NlZW5Nb2RlKFwibW9iaWxlXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHdpbmRvdy5pbm5lcldpZHRoID4gbW9iaWxlQnJlYWtwb2ludCAmJiB3aW5kb3cuaW5uZXJXaWR0aCA8IGRlc2t0b3BCcmVha3BvaW50KSB7XG4gICAgICAgICAgICBpZiAoc2NyZWVuTW9kZSAhPT0gXCJ0YWJsZXRcIikge1xuICAgICAgICAgICAgICAgIHNldFNjZWVuTW9kZShcInRhYmxldFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA+PSBkZXNrdG9wQnJlYWtwb2ludCkge1xuICAgICAgICAgICAgaWYgKHNjcmVlbk1vZGUgIT09IFwiZGVza3RvcFwiKSB7XG4gICAgICAgICAgICAgICAgc2V0U2NlZW5Nb2RlKFwiZGVza3RvcFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGZ1bmN0aW9uIHNldEdyaWRDb2x1bW5zKCkge1xuICAgICAgICAgICAgY29uc3Qgb2Zmc2V0ID0ga2VlcExhc3RCb29sZWFuID8gLTEgOiAwO1xuICAgICAgICAgICAgY29uc3QgY29sdW1uQXJyYXkgPSB0ZW1wbGF0ZUNvbHVtbnMucmVwbGFjZShcImdyaWQtdGVtcGxhdGUtY29sdW1uczogXCIsIFwiXCIpLnNwbGl0KC8gKD8hW14oKV0qXFwpKS8pOyAvLyBSZWdleCBmb3Igc3BhY2Ugd2hlbiBub3QgaW5zaWRlICgpXG4gICAgICAgICAgICBjb25zdCB2aXNpYmxlQ29sdW1ucyA9IHNjcmVlbk1vZGUgPT09IFwibW9iaWxlXCIgPyBtYXhDb2x1bW5zTW9iaWxlIDogbWF4Q29sdW1uc1RhYmxldDtcbiAgICAgICAgICAgIGNvbnN0IG1heENvbHVtbkFycmF5ID0gY29sdW1uQXJyYXkuc2xpY2UoY29sdW1uQXJyYXkubGVuZ3RoIC0gdmlzaWJsZUNvbHVtbnMgLSBvZmZzZXQpOyAvLyByZW1vdmUgYWxsIGJ1dCB0aGUgbGFzdCBtYXhDb2x1bW5zTW9iaWxlXG5cbiAgICAgICAgICAgIGlmIChvZmZzZXQpIHtcbiAgICAgICAgICAgICAgICBtYXhDb2x1bW5BcnJheS5wdXNoKFwiZml0LWNvbnRlbnQoMTAwJSlcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtYXhDb2x1bW5BcnJheS5qb2luKFwiIFwiKS5yZXBsYWNlKFwiO1wiLCBcIlwiKTtcbiAgICAgICAgICAgIG1heENvbHVtbkFycmF5LnVuc2hpZnQoXCJmaXQtY29udGVudCgxMDAlKVwiKTsgLy8gYWRkIG5ldyBjb2x1bW4gZm9yIHRoZSBjaGV2cm9uXG4gICAgICAgICAgICBtYXhDb2x1bW5BcnJheS5zcGxpY2UoMiwgMSwgXCIxZnJcIik7IC8vIGNvbnZlcnQgYXQgbGVhc3Qgb25lIGF1dG8tZmlsbCBjb2x1bW4gdG8gYXV0by1maWxsXG4gICAgICAgICAgICB0YWJsZUNvbnRlbnQuc2V0QXR0cmlidXRlKFwic3R5bGVcIiwgYGdyaWQtdGVtcGxhdGUtY29sdW1uczogJHttYXhDb2x1bW5BcnJheS5qb2luKFwiIFwiKS5yZXBsYWNlKFwiO1wiLCBcIlwiKX07YCk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiB0b2dnbGVUckNvbGxhcHNlKGV2ZW50LCBjaGV2cm9uQnRuKSB7XG4gICAgICAgICAgICBjb25zb2xlLmluZm8oXCJ0b2dnbGVUckNvbGxhcHNlXCIpO1xuICAgICAgICAgICAgY29uc3Qgbm90Q29sbGFwc2VkID0gW1xuICAgICAgICAgICAgICAgIC4uLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudHItcmVzcC1jb2xsYXBzaWJsZTpub3QoLnRyLXJlc3AtY29sbGFwc2libGUtLWNvbGxhcHNlZClcIilcbiAgICAgICAgICAgIF07XG4gICAgICAgICAgICBpZiAobm90Q29sbGFwc2VkLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIG5vdENvbGxhcHNlZC5mb3JFYWNoKGNoZXZyb25Sb3cgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByb3dCdG4gPSBjaGV2cm9uUm93LnBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5idG4tdGQtcmVzcC1jb2xsYXBzZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJvd0J0biAhPT0gY2hldnJvbkJ0bikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hldnJvblJvdy5jbGFzc0xpc3QudG9nZ2xlKFwidHItcmVzcC1jb2xsYXBzaWJsZS0tY29sbGFwc2VkXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hldnJvblJvdy5wYXJlbnRFbGVtZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnF1ZXJ5U2VsZWN0b3IoXCIuYnRuLXRkLXJlc3AtY29sbGFwc2VcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY2xhc3NMaXN0LnRvZ2dsZShcImJ0bi10ZC1yZXNwLWNvbGxhcHNlLS1hY3RpdmVcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2hldnJvbkJ0bi5jbGFzc0xpc3QudG9nZ2xlKFwiYnRuLXRkLXJlc3AtY29sbGFwc2UtLWFjdGl2ZVwiKTtcbiAgICAgICAgICAgIGV2ZW50LnRhcmdldFxuICAgICAgICAgICAgICAgIC5jbG9zZXN0KFwiLnRyXCIpXG4gICAgICAgICAgICAgICAgLnF1ZXJ5U2VsZWN0b3IoXCIudHItcmVzcC1jb2xsYXBzaWJsZVwiKVxuICAgICAgICAgICAgICAgIC5jbGFzc0xpc3QudG9nZ2xlKFwidHItcmVzcC1jb2xsYXBzaWJsZS0tY29sbGFwc2VkXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2hlY2sgdGhlIGNvbHVtbiB0byBpbnNlcnQgdGhlIGNoZXZyb25cbiAgICAgICAgZnVuY3Rpb24gcmVuZGVyQ2hldnJvbihyb3cpIHtcbiAgICAgICAgICAgIC8vIENoZWNrIGZpcnN0IFRIIGlmIHRoZXJlIGlzIG5vIGNoZXZyb24gcHJlc2VudFxuICAgICAgICAgICAgaWYgKCFyb3cucXVlcnlTZWxlY3RvcihcIi50aC5jaGV2cm9uLXRoXCIpKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0VEggPSByb3cucXVlcnlTZWxlY3RvcihcIi50aFwiKTtcbiAgICAgICAgICAgICAgICBjb25zdCBleHRyYVRIID0gYDxkaXYgY2xhc3M9XCJ0aCBjaGV2cm9uLXRoXCIgcm9sZT1cImNvbHVtbmhlYWRlclwiPjxkaXYgY2xhc3M9XCJjb2x1bW4tY29udGFpbmVyXCI+Jm5ic3A7PC9kaXY+PC9kaXY+YDtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZWN0VEggJiYgc2VsZWN0VEgucXVlcnlTZWxlY3RvcihcIi50ZC1jdXN0b20tY29udGVudFwiKSkge1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3RUSC5pbnNlcnRBZGphY2VudEhUTUwoXCJhZnRlcmVuZFwiLCBleHRyYVRIKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNlbGVjdFRIKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdFRILmluc2VydEFkamFjZW50SFRNTChcImJlZm9yZWJlZ2luXCIsIGV4dHJhVEgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQ2hlY2sgZmlyc3QgVEQgaWYgdGhlcmUgaXMgbm8gY2hldnJvbiBwcmVzZW50XG4gICAgICAgICAgICBpZiAoIXJvdy5xdWVyeVNlbGVjdG9yKFwiLnRkLmNoZXZyb24tdGRcIikpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzZWxlY3RURCA9IHJvdy5xdWVyeVNlbGVjdG9yKFwiLnRkXCIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGJvcmRlckNsYXNzID0gcm93LnF1ZXJ5U2VsZWN0b3IoXCIudGQtYm9yZGVyc1wiKSA/IFwidGQtYm9yZGVycyBcIiA6IFwiXCI7XG4gICAgICAgICAgICAgICAgY29uc3QgZXh0cmFURCA9IGA8ZGl2IGNsYXNzPVwidGQgJHtib3JkZXJDbGFzc31jaGV2cm9uLXRkIGJ0bi10ZC1yZXNwLWNvbGxhcHNlXCIgcm9sZT1cImdyaWRjZWxsXCI+PGRpdiBjbGFzcz1cInRkLWN1c3RvbS1jb250ZW50XCI+PHN2ZyBoZWlnaHQ9XCIxNlwiIHdpZHRoPVwiMTZcIiB2aWV3Qm94PVwiMCAwIDE2IDE2XCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIGZpbGw9XCJjdXJyZW50Q29sb3JcIj48cGF0aCBkPVwiTTguMDAwMDQgMTEuMTM2OUM4LjIxMDMzIDExLjEzNjkgOC4zODc0MSAxMS4wNTM5IDguNTQ3ODkgMTAuODkzNEwxMi40OTM1IDYuODUzNjhDMTIuNjIwOCA2LjcyMDg3IDEyLjY4NzIgNi41NjU5MiAxMi42ODcyIDYuMzc3NzdDMTIuNjg3MiA1Ljk5MDQgMTIuMzgyOSA1LjY4NjA0IDEyLjAwNjYgNS42ODYwNEMxMS44MjM5IDUuNjg2MDQgMTEuNjQ2OSA1Ljc2MzUxIDExLjUwODUgNS45MDE4Nkw4LjAwNTU3IDkuNTA0MzlMNC40OTE1OCA1LjkwMTg2QzQuMzU4NzYgNS43NjkwNCA0LjE4NzIyIDUuNjg2MDQgMy45OTM1MyA1LjY4NjA0QzMuNjE3MjMgNS42ODYwNCAzLjMxMjg3IDUuOTkwNCAzLjMxMjg3IDYuMzc3NzdDMy4zMTI4NyA2LjU2MDM4IDMuMzg0ODEgNi43MjA4NyAzLjUxMjA4IDYuODUzNjhMNy40NTc3MiAxMC44OTM0QzcuNjIzNzQgMTEuMDU5NCA3Ljc5NTI5IDExLjEzNjkgOC4wMDAwNCAxMS4xMzY5WlwiLz48L3N2Zz48L2Rpdj48L2Rpdj5gO1xuICAgICAgICAgICAgICAgIGlmIChzZWxlY3RURCAmJiBzZWxlY3RURC5xdWVyeVNlbGVjdG9yKFwiLnRkLWN1c3RvbS1jb250ZW50XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdFRELmluc2VydEFkamFjZW50SFRNTChcImFmdGVyZW5kXCIsIGV4dHJhVEQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc2VsZWN0VEQpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0VEQuaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYmVmb3JlYmVnaW5cIiwgZXh0cmFURCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gcmVuZGVyQ29sbGFwc2libGVEaXYocm93KSB7XG4gICAgICAgICAgICBjb25zdCBjb2xsYXBzaWJsZURpdiA9IGA8ZGl2IGNsYXNzPVwidHItcmVzcC1jb2xsYXBzaWJsZSB0ci1yZXNwLWNvbGxhcHNpYmxlLS1jb2xsYXBzZWRcIj48L2Rpdj5gO1xuICAgICAgICAgICAgaWYgKCFyb3cucXVlcnlTZWxlY3RvcihcIi50ci1yZXNwLWNvbGxhcHNpYmxlXCIpKSB7XG4gICAgICAgICAgICAgICAgcm93Lmluc2VydEFkamFjZW50SFRNTChcImJlZm9yZWVuZFwiLCBjb2xsYXBzaWJsZURpdik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBtb3ZlQ29sdW1uc0luc2lkZUNvbGxhcHNpYmxlRGl2KHJvdykge1xuICAgICAgICAgICAgY29uc3Qgb2Zmc2V0ID0ga2VlcExhc3RCb29sZWFuID8gLTEgOiAwO1xuICAgICAgICAgICAgY29uc3QgdmlzaWJsZUNvbHVtbnMgPSBzY3JlZW5Nb2RlID09PSBcIm1vYmlsZVwiID8gbWF4Q29sdW1uc01vYmlsZSA6IG1heENvbHVtbnNUYWJsZXQ7XG4gICAgICAgICAgICBjb25zdCBUSHMgPSBbLi4ucm93LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGhcIildO1xuICAgICAgICAgICAgaWYgKFRIcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBUSHMuc2xpY2UoVEhzLmxlbmd0aCAtIChUSHMubGVuZ3RoIC0gdmlzaWJsZUNvbHVtbnMpICsgb2Zmc2V0LCBvZmZzZXQpLmZvckVhY2goVEggPT4ge1xuICAgICAgICAgICAgICAgICAgICBUSC5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBURHMgPSBbLi4ucm93LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGRcIildO1xuICAgICAgICAgICAgaWYgKFREcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBURHMuc2xpY2UoVERzLmxlbmd0aCAtIChURHMubGVuZ3RoIC0gdmlzaWJsZUNvbHVtbnMpICsgb2Zmc2V0LCBvZmZzZXQpLmZvckVhY2goKFRELCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBURC5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBoZWFkZXJzID0gW1xuICAgICAgICAgICAgICAgICAgICAgICAgLi4uZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcud2lkZ2V0LWRhdGFncmlkIC50cltyb2xlPVwicm93XCJdOmZpcnN0LWNoaWxkIC50aC5oaWRkZW4nXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbGxhcHNpYmxlID0gcm93LnF1ZXJ5U2VsZWN0b3IoXCIudHItcmVzcC1jb2xsYXBzaWJsZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sbGFwc2libGVDb250ZW50ID0gYDxkaXYgY2xhc3M9XCJ0ci1yZXNwLWNvbGxhcHNpYmxlX19pdGVtXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzcz1cInRkLXRleHQgdGV4dC1ib2xkIG5vbWFyZ2luXCI+JHtoZWFkZXJzW2luZGV4XT8ucXVlcnlTZWxlY3RvcihcInNwYW5cIikuaW5uZXJIVE1MfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRkLXRleHRcIj4ke1RELnF1ZXJ5U2VsZWN0b3IoXCJzcGFuXCIpPy5pbm5lckhUTUx9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+YDtcbiAgICAgICAgICAgICAgICAgICAgY29sbGFwc2libGUuaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYmVmb3JlZW5kXCIsIGNvbGxhcHNpYmxlQ29udGVudCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiByZW5kZXJFbGVtZW50cygpIHtcbiAgICAgICAgICAgIC8vIFByb2Nlc3MgZWFjaCByb3dcbiAgICAgICAgICAgIGRhdGFncmlkUm93c1JlZi5jdXJyZW50LmZvckVhY2gocm93ID0+IHtcbiAgICAgICAgICAgICAgICByZW5kZXJDb2xsYXBzaWJsZURpdihyb3cpO1xuICAgICAgICAgICAgICAgIG1vdmVDb2x1bW5zSW5zaWRlQ29sbGFwc2libGVEaXYocm93KTtcbiAgICAgICAgICAgICAgICByZW5kZXJDaGV2cm9uKHJvdyk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgY29uc3QgY2hldnJvbkJ0bnMgPSBbLi4uZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmJ0bi10ZC1yZXNwLWNvbGxhcHNlXCIpXTtcbiAgICAgICAgICAgIGNoZXZyb25CdG5zLmZvckVhY2goY2hldnJvbkJ0biA9PlxuICAgICAgICAgICAgICAgIGNoZXZyb25CdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGV2ZW50ID0+IHRvZ2dsZVRyQ29sbGFwc2UoZXZlbnQsIGNoZXZyb25CdG4pKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHJlc2V0Q29sbGFwc2libGVzKCkge1xuICAgICAgICAgICAgY29uc3QgYWxsQ29sbGFwc2libGVzID0gWy4uLmRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQucXVlcnlTZWxlY3RvckFsbChcIi50ci1yZXNwLWNvbGxhcHNpYmxlXCIpXTtcbiAgICAgICAgICAgIGFsbENvbGxhcHNpYmxlcy5mb3JFYWNoKGNvbGxhcHNpYmxlID0+IGNvbGxhcHNpYmxlLnJlbW92ZSgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHJlc2V0SGlkZGVuQ29sdW1ucygpIHtcbiAgICAgICAgICAgIGNvbnN0IGhpZGRlbkNvbHVtbnMgPSBbLi4uZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnRoLmhpZGRlbiwgLnRkLmhpZGRlblwiKV07XG4gICAgICAgICAgICBoaWRkZW5Db2x1bW5zLmZvckVhY2goaGlkZGVuQ29sdW1uID0+IGhpZGRlbkNvbHVtbi5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHJlc2V0Q2hldnJvbnMoKSB7XG4gICAgICAgICAgICBjb25zdCByb3dzID0gWy4uLmRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQucXVlcnlTZWxlY3RvckFsbCgnLnRyW3JvbGU9XCJyb3dcIl0nKV07XG4gICAgICAgICAgICByb3dzLmZvckVhY2gocm93ID0+IHtcbiAgICAgICAgICAgICAgICByb3cucXVlcnlTZWxlY3RvcihcIi50aC5jaGV2cm9uLXRoXCIpPy5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICByb3cucXVlcnlTZWxlY3RvcihcIi50ZC5jaGV2cm9uLXRkXCIpPy5yZW1vdmUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gb25Tb3J0KCkge1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIHdpbmRvdy5pbm5lcldpZHRoIDw9IG1vYmlsZUJyZWFrcG9pbnQgfHxcbiAgICAgICAgICAgICAgICAod2luZG93LmlubmVyV2lkdGggPiBtb2JpbGVCcmVha3BvaW50ICYmIHdpbmRvdy5pbm5lcldpZHRoIDwgZGVza3RvcEJyZWFrcG9pbnQpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oXCJvblNvcnRcIiwgc2NyZWVuTW9kZSk7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlc2V0Q29sbGFwc2libGVzKCk7XG4gICAgICAgICAgICAgICAgICAgIHJlc2V0SGlkZGVuQ29sdW1ucygpO1xuICAgICAgICAgICAgICAgICAgICByZXNldENoZXZyb25zKCk7XG4gICAgICAgICAgICAgICAgICAgIHJlbmRlckVsZW1lbnRzKCk7XG4gICAgICAgICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjYW5SZW5kZXIgJiYgc2NyZWVuTW9kZSkge1xuICAgICAgICAgICAgY29uc3QgaGVhZGVycyA9IFsuLi5kYXRhZ3JpZFJvd3NSZWYuY3VycmVudFswXS5xdWVyeVNlbGVjdG9yQWxsKFwiLnRoXCIpXTtcblxuICAgICAgICAgICAgLy8gRm9yIGRlc2t0b3AgbGVhdmUgLyByZXN0b3JlIGRlZmF1bHQuIEZvciBvdGhlciBzaXR1YXRpb25zIHVwZGF0ZSB0byBtb2JpbGUgLyB0YWJsZXQgY29sdW1uc1xuICAgICAgICAgICAgaWYgKHNjcmVlbk1vZGUgPT09IFwiZGVza3RvcFwiKSB7XG4gICAgICAgICAgICAgICAgdGFibGVDb250ZW50LnNldEF0dHJpYnV0ZShcInN0eWxlXCIsIHRlbXBsYXRlQ29sdW1ucyk7XG4gICAgICAgICAgICAgICAgcmVzZXRDb2xsYXBzaWJsZXMoKTtcbiAgICAgICAgICAgICAgICByZXNldEhpZGRlbkNvbHVtbnMoKTtcbiAgICAgICAgICAgICAgICByZXNldENoZXZyb25zKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNldEdyaWRDb2x1bW5zKCk7XG4gICAgICAgICAgICAgICAgcmVzZXRDb2xsYXBzaWJsZXMoKTtcbiAgICAgICAgICAgICAgICByZXNldEhpZGRlbkNvbHVtbnMoKTtcbiAgICAgICAgICAgICAgICByZXNldENoZXZyb25zKCk7XG4gICAgICAgICAgICAgICAgcmVuZGVyRWxlbWVudHMoKTtcbiAgICAgICAgICAgICAgICBoZWFkZXJzLmZvckVhY2goaGVhZGVyID0+IGhlYWRlci5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgb25Tb3J0KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2NyZWVuTW9kZSAhPT0gXCJkZXNrdG9wXCIpIHtcbiAgICAgICAgICAgIC8vIERldGVjdCBhIGNoYW5nZSBpbiBEYXRhIGdyaWQgMiBhZnRlciB0aGUgaW5pdGlhbCByZW5kZXJpbmcgb2YgZXZlcnl0aGluZ1xuICAgICAgICAgICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigoKSA9PiB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgICAgIGlmIChkYXRhZ3JpZFJvd3NSZWYuY3VycmVudCAhPT0gZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnRyW3JvbGU9cm93XVwiKSkge1xuICAgICAgICAgICAgICAgICAgICBkYXRhZ3JpZFJvd3NSZWYuY3VycmVudCA9IFsuLi5kYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudHJbcm9sZT1yb3ddXCIpXTtcbiAgICAgICAgICAgICAgICAgICAgcmVzZXRDb2xsYXBzaWJsZXMoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzZXRIaWRkZW5Db2x1bW5zKCk7XG4gICAgICAgICAgICAgICAgICAgIHJlc2V0Q2hldnJvbnMoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyRWxlbWVudHMoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQsIGNvbmZpZyk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKGRhdGFncmlkV2lkZ2V0UmVmICYmIGRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQsIGNvbmZpZyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiAoKSA9PiBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgaWYgKGRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICBzZXRUYWJsZUNvbnRlbnQoZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudC5xdWVyeVNlbGVjdG9yKFwiLndpZGdldC1kYXRhZ3JpZCAud2lkZ2V0LWRhdGFncmlkLWdyaWQtYm9keVwiKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQsIGNvbmZpZyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChkYXRhZ3JpZFdpZGdldFJlZiAmJiBkYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQsIGNvbmZpZyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKCkgPT4gb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgIH0pO1xuXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgaWYgKHRhYmxlQ29udGVudCkge1xuICAgICAgICAgICAgc2V0VGVtcGxhdGVDb2x1bW5zKHRhYmxlQ29udGVudC5nZXRBdHRyaWJ1dGUoXCJzdHlsZVwiKSk7XG4gICAgICAgICAgICBpZiAod2luZG93LmlubmVyV2lkdGggPD0gbW9iaWxlQnJlYWtwb2ludCkge1xuICAgICAgICAgICAgICAgIHNldFNjZWVuTW9kZShcIm1vYmlsZVwiKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAod2luZG93LmlubmVyV2lkdGggPiBtb2JpbGVCcmVha3BvaW50ICYmIHdpbmRvdy5pbm5lcldpZHRoIDwgZGVza3RvcEJyZWFrcG9pbnQpIHtcbiAgICAgICAgICAgICAgICBzZXRTY2Vlbk1vZGUoXCJ0YWJsZXRcIik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHdpbmRvdy5pbm5lcldpZHRoID49IGRlc2t0b3BCcmVha3BvaW50KSB7XG4gICAgICAgICAgICAgICAgc2V0U2NlZW5Nb2RlKFwiZGVza3RvcFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNldENhblJlbmRlcih0cnVlKTtcbiAgICAgICAgfVxuICAgIH0sIFtkZXNrdG9wQnJlYWtwb2ludCwgbW9iaWxlQnJlYWtwb2ludCwgdGFibGVDb250ZW50XSk7XG5cbiAgICBpZiAoY2FuUmVuZGVyKSB7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHNjcmVlblNpemVDaGVjayk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e2ByZXNwb25zaXZlLWRhdGFncmlkICR7c3R5bGV9YH0gcmVmPXtkYXRhZ3JpZFdpZGdldFJlZn0+XG4gICAgICAgICAgICB7ZGF0YUdyaWRXaWRnZXR9XG4gICAgICAgIDwvZGl2PlxuICAgICk7XG59XG4iXSwibmFtZXMiOlsiUmVzcG9uc2l2ZURhdGFncmlkVHdvIiwiZGF0YUdyaWRXaWRnZXQiLCJkZXNrdG9wQnJlYWtwb2ludCIsImtlZXBMYXN0Qm9vbGVhbiIsIm1heENvbHVtbnNNb2JpbGUiLCJtYXhDb2x1bW5zVGFibGV0IiwibW9iaWxlQnJlYWtwb2ludCIsInJlc3QiLCJzdHlsZSIsImNsYXNzIiwiZGF0YWdyaWRXaWRnZXRSZWYiLCJ1c2VSZWYiLCJkYXRhZ3JpZFJvd3NSZWYiLCJ0YWJsZUNvbnRlbnQiLCJzZXRUYWJsZUNvbnRlbnQiLCJ1c2VTdGF0ZSIsImNhblJlbmRlciIsInNldENhblJlbmRlciIsInRlbXBsYXRlQ29sdW1ucyIsInNldFRlbXBsYXRlQ29sdW1ucyIsInNjcmVlbk1vZGUiLCJzZXRTY2Vlbk1vZGUiLCJjb25maWciLCJjaGlsZExpc3QiLCJzdWJ0cmVlIiwic2NyZWVuU2l6ZUNoZWNrIiwid2luZG93IiwiaW5uZXJXaWR0aCIsInVzZUVmZmVjdCIsInNldEdyaWRDb2x1bW5zIiwib2Zmc2V0IiwiY29sdW1uQXJyYXkiLCJyZXBsYWNlIiwic3BsaXQiLCJ2aXNpYmxlQ29sdW1ucyIsIm1heENvbHVtbkFycmF5Iiwic2xpY2UiLCJsZW5ndGgiLCJwdXNoIiwiam9pbiIsInVuc2hpZnQiLCJzcGxpY2UiLCJzZXRBdHRyaWJ1dGUiLCJ0b2dnbGVUckNvbGxhcHNlIiwiZXZlbnQiLCJjaGV2cm9uQnRuIiwiY29uc29sZSIsImluZm8iLCJub3RDb2xsYXBzZWQiLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJmb3JFYWNoIiwiY2hldnJvblJvdyIsInJvd0J0biIsInBhcmVudEVsZW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwiY2xhc3NMaXN0IiwidG9nZ2xlIiwidGFyZ2V0IiwiY2xvc2VzdCIsInJlbmRlckNoZXZyb24iLCJyb3ciLCJzZWxlY3RUSCIsImV4dHJhVEgiLCJpbnNlcnRBZGphY2VudEhUTUwiLCJzZWxlY3RURCIsImJvcmRlckNsYXNzIiwiZXh0cmFURCIsInJlbmRlckNvbGxhcHNpYmxlRGl2IiwiY29sbGFwc2libGVEaXYiLCJtb3ZlQ29sdW1uc0luc2lkZUNvbGxhcHNpYmxlRGl2IiwiVEhzIiwiVEgiLCJhZGQiLCJURHMiLCJURCIsImluZGV4IiwiaGVhZGVycyIsImN1cnJlbnQiLCJjb2xsYXBzaWJsZSIsImNvbGxhcHNpYmxlQ29udGVudCIsImlubmVySFRNTCIsInJlbmRlckVsZW1lbnRzIiwiY2hldnJvbkJ0bnMiLCJhZGRFdmVudExpc3RlbmVyIiwicmVzZXRDb2xsYXBzaWJsZXMiLCJhbGxDb2xsYXBzaWJsZXMiLCJyZW1vdmUiLCJyZXNldEhpZGRlbkNvbHVtbnMiLCJoaWRkZW5Db2x1bW5zIiwiaGlkZGVuQ29sdW1uIiwicmVzZXRDaGV2cm9ucyIsInJvd3MiLCJvblNvcnQiLCJzZXRUaW1lb3V0IiwiaGVhZGVyIiwib2JzZXJ2ZXIiLCJNdXRhdGlvbk9ic2VydmVyIiwiZGlzY29ubmVjdCIsIm9ic2VydmUiLCJnZXRBdHRyaWJ1dGUiLCJjcmVhdGVFbGVtZW50IiwiY2xhc3NOYW1lIiwicmVmIl0sIm1hcHBpbmdzIjoiOztJQUdPLFNBQVNBLHFCQUFxQkEsQ0FBQztNQUNsQ0MsY0FBYztNQUNkQyxpQkFBaUI7TUFDakJDLGVBQWU7TUFDZkMsZ0JBQWdCO01BQ2hCQyxnQkFBZ0I7TUFDaEJDLGdCQUFnQjtNQUNo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
