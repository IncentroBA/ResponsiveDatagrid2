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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzcG9uc2l2ZURhdGFncmlkVHdvLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvUmVzcG9uc2l2ZURhdGFncmlkVHdvLmpzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgXCIuL3VpL1Jlc3BvbnNpdmVEYXRhZ3JpZFR3by5jc3NcIjtcbmltcG9ydCB7IGNyZWF0ZUVsZW1lbnQsIHVzZUVmZmVjdCwgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuXG5leHBvcnQgZnVuY3Rpb24gUmVzcG9uc2l2ZURhdGFncmlkVHdvKHtcbiAgICBkYXRhR3JpZFdpZGdldCxcbiAgICBkZXNrdG9wQnJlYWtwb2ludCxcbiAgICBrZWVwTGFzdEJvb2xlYW4sXG4gICAgbWF4Q29sdW1uc01vYmlsZSxcbiAgICBtYXhDb2x1bW5zVGFibGV0LFxuICAgIG1vYmlsZUJyZWFrcG9pbnQsXG4gICAgLi4ucmVzdFxufSkge1xuICAgIGNvbnN0IHN0eWxlID0gcmVzdC5jbGFzcyB8fCBcIlwiO1xuICAgIGNvbnN0IGRhdGFncmlkV2lkZ2V0UmVmID0gdXNlUmVmKG51bGwpO1xuICAgIGNvbnN0IGRhdGFncmlkUm93c1JlZiA9IHVzZVJlZihbXSk7XG4gICAgY29uc3QgW3RhYmxlQ29udGVudCwgc2V0VGFibGVDb250ZW50XSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtjYW5SZW5kZXIsIHNldENhblJlbmRlcl0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3QgW3RlbXBsYXRlQ29sdW1ucywgc2V0VGVtcGxhdGVDb2x1bW5zXSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtzY3JlZW5Nb2RlLCBzZXRTY2Vlbk1vZGVdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgY29uZmlnID0ge1xuICAgICAgICAvLyBhdHRyaWJ1dGVzOiB0cnVlLFxuICAgICAgICAvLyBhdHRyaWJ1dGVPbGRWYWx1ZTogdHJ1ZSxcbiAgICAgICAgY2hpbGRMaXN0OiB0cnVlLCAvLyBUaGlzIGlzIGEgbXVzdCBoYXZlIGZvciB0aGUgb2JzZXJ2ZXIgd2l0aCBzdWJ0cmVlXG4gICAgICAgIHN1YnRyZWU6IHRydWUgLy8gU2V0IHRvIHRydWUgaWYgY2hhbmdlcyBtdXN0IGFsc28gYmUgb2JzZXJ2ZWQgaW4gZGVzY2VuZGFudHMuXG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIHNjcmVlblNpemVDaGVjaygpIHtcbiAgICAgICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoIDw9IG1vYmlsZUJyZWFrcG9pbnQpIHtcbiAgICAgICAgICAgIGlmIChzY3JlZW5Nb2RlICE9PSBcIm1vYmlsZVwiKSB7XG4gICAgICAgICAgICAgICAgc2V0U2NlZW5Nb2RlKFwibW9iaWxlXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHdpbmRvdy5pbm5lcldpZHRoID4gbW9iaWxlQnJlYWtwb2ludCAmJiB3aW5kb3cuaW5uZXJXaWR0aCA8IGRlc2t0b3BCcmVha3BvaW50KSB7XG4gICAgICAgICAgICBpZiAoc2NyZWVuTW9kZSAhPT0gXCJ0YWJsZXRcIikge1xuICAgICAgICAgICAgICAgIHNldFNjZWVuTW9kZShcInRhYmxldFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA+PSBkZXNrdG9wQnJlYWtwb2ludCkge1xuICAgICAgICAgICAgaWYgKHNjcmVlbk1vZGUgIT09IFwiZGVza3RvcFwiKSB7XG4gICAgICAgICAgICAgICAgc2V0U2NlZW5Nb2RlKFwiZGVza3RvcFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGZ1bmN0aW9uIHNldEdyaWRDb2x1bW5zKCkge1xuICAgICAgICAgICAgY29uc3Qgb2Zmc2V0ID0ga2VlcExhc3RCb29sZWFuID8gLTEgOiAwO1xuICAgICAgICAgICAgY29uc3QgY29sdW1uQXJyYXkgPSB0ZW1wbGF0ZUNvbHVtbnMucmVwbGFjZShcImdyaWQtdGVtcGxhdGUtY29sdW1uczogXCIsIFwiXCIpLnNwbGl0KC8gKD8hW14oKV0qXFwpKS8pOyAvLyBSZWdleCBmb3Igc3BhY2Ugd2hlbiBub3QgaW5zaWRlICgpXG4gICAgICAgICAgICBjb25zdCB2aXNpYmxlQ29sdW1ucyA9IHNjcmVlbk1vZGUgPT09IFwibW9iaWxlXCIgPyBtYXhDb2x1bW5zTW9iaWxlIDogbWF4Q29sdW1uc1RhYmxldDtcbiAgICAgICAgICAgIGNvbnN0IG1heENvbHVtbkFycmF5ID0gY29sdW1uQXJyYXkuc2xpY2UoY29sdW1uQXJyYXkubGVuZ3RoIC0gdmlzaWJsZUNvbHVtbnMgLSBvZmZzZXQpOyAvLyByZW1vdmUgYWxsIGJ1dCB0aGUgbGFzdCBtYXhDb2x1bW5zTW9iaWxlXG5cbiAgICAgICAgICAgIGlmIChvZmZzZXQpIHtcbiAgICAgICAgICAgICAgICBtYXhDb2x1bW5BcnJheS5wdXNoKFwiZml0LWNvbnRlbnQoMTAwJSlcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtYXhDb2x1bW5BcnJheS5qb2luKFwiIFwiKS5yZXBsYWNlKFwiO1wiLCBcIlwiKTtcbiAgICAgICAgICAgIG1heENvbHVtbkFycmF5LnVuc2hpZnQoXCJmaXQtY29udGVudCgxMDAlKVwiKTsgLy8gYWRkIG5ldyBjb2x1bW4gZm9yIHRoZSBjaGV2cm9uXG4gICAgICAgICAgICBtYXhDb2x1bW5BcnJheS5zcGxpY2UoMiwgMSwgXCIxZnJcIik7IC8vIGNvbnZlcnQgYXQgbGVhc3Qgb25lIGF1dG8tZmlsbCBjb2x1bW4gdG8gYXV0by1maWxsXG4gICAgICAgICAgICB0YWJsZUNvbnRlbnQuc2V0QXR0cmlidXRlKFwic3R5bGVcIiwgYGdyaWQtdGVtcGxhdGUtY29sdW1uczogJHttYXhDb2x1bW5BcnJheS5qb2luKFwiIFwiKS5yZXBsYWNlKFwiO1wiLCBcIlwiKX07YCk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiB0b2dnbGVUckNvbGxhcHNlKGV2ZW50LCBjaGV2cm9uQnRuKSB7XG4gICAgICAgICAgICBjb25zdCBub3RDb2xsYXBzZWQgPSBbXG4gICAgICAgICAgICAgICAgLi4uZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi50ci1yZXNwLWNvbGxhcHNpYmxlOm5vdCgudHItcmVzcC1jb2xsYXBzaWJsZS0tY29sbGFwc2VkKVwiKVxuICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIGlmIChub3RDb2xsYXBzZWQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgbm90Q29sbGFwc2VkLmZvckVhY2goY2hldnJvblJvdyA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJvd0J0biA9IGNoZXZyb25Sb3cucGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmJ0bi10ZC1yZXNwLWNvbGxhcHNlXCIpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocm93QnRuICE9PSBjaGV2cm9uQnRuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGV2cm9uUm93LmNsYXNzTGlzdC50b2dnbGUoXCJ0ci1yZXNwLWNvbGxhcHNpYmxlLS1jb2xsYXBzZWRcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGV2cm9uUm93LnBhcmVudEVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucXVlcnlTZWxlY3RvcihcIi5idG4tdGQtcmVzcC1jb2xsYXBzZVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jbGFzc0xpc3QudG9nZ2xlKFwiYnRuLXRkLXJlc3AtY29sbGFwc2UtLWFjdGl2ZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjaGV2cm9uQnRuLmNsYXNzTGlzdC50b2dnbGUoXCJidG4tdGQtcmVzcC1jb2xsYXBzZS0tYWN0aXZlXCIpO1xuICAgICAgICAgICAgZXZlbnQudGFyZ2V0XG4gICAgICAgICAgICAgICAgLmNsb3Nlc3QoXCIudHJcIilcbiAgICAgICAgICAgICAgICAucXVlcnlTZWxlY3RvcihcIi50ci1yZXNwLWNvbGxhcHNpYmxlXCIpXG4gICAgICAgICAgICAgICAgLmNsYXNzTGlzdC50b2dnbGUoXCJ0ci1yZXNwLWNvbGxhcHNpYmxlLS1jb2xsYXBzZWRcIik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDaGVjayB0aGUgY29sdW1uIHRvIGluc2VydCB0aGUgY2hldnJvblxuICAgICAgICBmdW5jdGlvbiByZW5kZXJDaGV2cm9uKHJvdykge1xuICAgICAgICAgICAgLy8gQ2hlY2sgZmlyc3QgVEggaWYgdGhlcmUgaXMgbm8gY2hldnJvbiBwcmVzZW50XG4gICAgICAgICAgICBpZiAoIXJvdy5xdWVyeVNlbGVjdG9yKFwiLnRoLmNoZXZyb24tdGhcIikpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzZWxlY3RUSCA9IHJvdy5xdWVyeVNlbGVjdG9yKFwiLnRoXCIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGV4dHJhVEggPSBgPGRpdiBjbGFzcz1cInRoIGNoZXZyb24tdGhcIiByb2xlPVwiY29sdW1uaGVhZGVyXCI+PGRpdiBjbGFzcz1cImNvbHVtbi1jb250YWluZXJcIj4mbmJzcDs8L2Rpdj48L2Rpdj5gO1xuICAgICAgICAgICAgICAgIGlmIChzZWxlY3RUSCAmJiBzZWxlY3RUSC5xdWVyeVNlbGVjdG9yKFwiLnRkLWN1c3RvbS1jb250ZW50XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdFRILmluc2VydEFkamFjZW50SFRNTChcImFmdGVyZW5kXCIsIGV4dHJhVEgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc2VsZWN0VEgpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0VEguaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYmVmb3JlYmVnaW5cIiwgZXh0cmFUSCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDaGVjayBmaXJzdCBURCBpZiB0aGVyZSBpcyBubyBjaGV2cm9uIHByZXNlbnRcbiAgICAgICAgICAgIGlmICghcm93LnF1ZXJ5U2VsZWN0b3IoXCIudGQuY2hldnJvbi10ZFwiKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNlbGVjdFREID0gcm93LnF1ZXJ5U2VsZWN0b3IoXCIudGRcIik7XG4gICAgICAgICAgICAgICAgY29uc3QgYm9yZGVyQ2xhc3MgPSByb3cucXVlcnlTZWxlY3RvcihcIi50ZC1ib3JkZXJzXCIpID8gXCJ0ZC1ib3JkZXJzIFwiIDogXCJcIjtcbiAgICAgICAgICAgICAgICBjb25zdCBleHRyYVREID0gYDxkaXYgY2xhc3M9XCJ0ZCAke2JvcmRlckNsYXNzfWNoZXZyb24tdGQgYnRuLXRkLXJlc3AtY29sbGFwc2VcIiByb2xlPVwiZ3JpZGNlbGxcIj48ZGl2IGNsYXNzPVwidGQtY3VzdG9tLWNvbnRlbnRcIj48c3ZnIGhlaWdodD1cIjE2XCIgd2lkdGg9XCIxNlwiIHZpZXdCb3g9XCIwIDAgMTYgMTZcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgZmlsbD1cImN1cnJlbnRDb2xvclwiPjxwYXRoIGQ9XCJNOC4wMDAwNCAxMS4xMzY5QzguMjEwMzMgMTEuMTM2OSA4LjM4NzQxIDExLjA1MzkgOC41NDc4OSAxMC44OTM0TDEyLjQ5MzUgNi44NTM2OEMxMi42MjA4IDYuNzIwODcgMTIuNjg3MiA2LjU2NTkyIDEyLjY4NzIgNi4zNzc3N0MxMi42ODcyIDUuOTkwNCAxMi4zODI5IDUuNjg2MDQgMTIuMDA2NiA1LjY4NjA0QzExLjgyMzkgNS42ODYwNCAxMS42NDY5IDUuNzYzNTEgMTEuNTA4NSA1LjkwMTg2TDguMDA1NTcgOS41MDQzOUw0LjQ5MTU4IDUuOTAxODZDNC4zNTg3NiA1Ljc2OTA0IDQuMTg3MjIgNS42ODYwNCAzLjk5MzUzIDUuNjg2MDRDMy42MTcyMyA1LjY4NjA0IDMuMzEyODcgNS45OTA0IDMuMzEyODcgNi4zNzc3N0MzLjMxMjg3IDYuNTYwMzggMy4zODQ4MSA2LjcyMDg3IDMuNTEyMDggNi44NTM2OEw3LjQ1NzcyIDEwLjg5MzRDNy42MjM3NCAxMS4wNTk0IDcuNzk1MjkgMTEuMTM2OSA4LjAwMDA0IDExLjEzNjlaXCIvPjwvc3ZnPjwvZGl2PjwvZGl2PmA7XG4gICAgICAgICAgICAgICAgaWYgKHNlbGVjdFREICYmIHNlbGVjdFRELnF1ZXJ5U2VsZWN0b3IoXCIudGQtY3VzdG9tLWNvbnRlbnRcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0VEQuaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYWZ0ZXJlbmRcIiwgZXh0cmFURCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzZWxlY3RURCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3RURC5pbnNlcnRBZGphY2VudEhUTUwoXCJiZWZvcmViZWdpblwiLCBleHRyYVREKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiByZW5kZXJDb2xsYXBzaWJsZURpdihyb3cpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbGxhcHNpYmxlRGl2ID0gYDxkaXYgY2xhc3M9XCJ0ci1yZXNwLWNvbGxhcHNpYmxlIHRyLXJlc3AtY29sbGFwc2libGUtLWNvbGxhcHNlZFwiPjwvZGl2PmA7XG4gICAgICAgICAgICBpZiAoIXJvdy5xdWVyeVNlbGVjdG9yKFwiLnRyLXJlc3AtY29sbGFwc2libGVcIikpIHtcbiAgICAgICAgICAgICAgICByb3cuaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYmVmb3JlZW5kXCIsIGNvbGxhcHNpYmxlRGl2KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIG1vdmVDb2x1bW5zSW5zaWRlQ29sbGFwc2libGVEaXYocm93KSB7XG4gICAgICAgICAgICBjb25zdCBvZmZzZXQgPSBrZWVwTGFzdEJvb2xlYW4gPyAtMSA6IDA7XG4gICAgICAgICAgICBjb25zdCB2aXNpYmxlQ29sdW1ucyA9IHNjcmVlbk1vZGUgPT09IFwibW9iaWxlXCIgPyBtYXhDb2x1bW5zTW9iaWxlIDogbWF4Q29sdW1uc1RhYmxldDtcbiAgICAgICAgICAgIGNvbnN0IFRIcyA9IFsuLi5yb3cucXVlcnlTZWxlY3RvckFsbChcIi50aFwiKV07XG4gICAgICAgICAgICBpZiAoVEhzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIFRIcy5zbGljZShUSHMubGVuZ3RoIC0gKFRIcy5sZW5ndGggLSB2aXNpYmxlQ29sdW1ucykgKyBvZmZzZXQsIG9mZnNldCkuZm9yRWFjaChUSCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIFRILmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IFREcyA9IFsuLi5yb3cucXVlcnlTZWxlY3RvckFsbChcIi50ZFwiKV07XG4gICAgICAgICAgICBpZiAoVERzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIFREcy5zbGljZShURHMubGVuZ3RoIC0gKFREcy5sZW5ndGggLSB2aXNpYmxlQ29sdW1ucykgKyBvZmZzZXQsIG9mZnNldCkuZm9yRWFjaCgoVEQsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIFRELmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhlYWRlcnMgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5kYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJy53aWRnZXQtZGF0YWdyaWQgLnRyW3JvbGU9XCJyb3dcIl06Zmlyc3QtY2hpbGQgLnRoLmhpZGRlbidcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sbGFwc2libGUgPSByb3cucXVlcnlTZWxlY3RvcihcIi50ci1yZXNwLWNvbGxhcHNpYmxlXCIpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb2xsYXBzaWJsZUNvbnRlbnQgPSBgPGRpdiBjbGFzcz1cInRyLXJlc3AtY29sbGFwc2libGVfX2l0ZW1cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwidGQtdGV4dCB0ZXh0LWJvbGQgbm9tYXJnaW5cIj4ke2hlYWRlcnNbaW5kZXhdPy5xdWVyeVNlbGVjdG9yKFwic3BhblwiKS5pbm5lckhUTUx9PC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidGQtdGV4dFwiPiR7VEQucXVlcnlTZWxlY3RvcihcInNwYW5cIik/LmlubmVySFRNTH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5gO1xuICAgICAgICAgICAgICAgICAgICBjb2xsYXBzaWJsZS5pbnNlcnRBZGphY2VudEhUTUwoXCJiZWZvcmVlbmRcIiwgY29sbGFwc2libGVDb250ZW50KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHJlbmRlckVsZW1lbnRzKCkge1xuICAgICAgICAgICAgLy8gUHJvY2VzcyBlYWNoIHJvd1xuICAgICAgICAgICAgZGF0YWdyaWRSb3dzUmVmLmN1cnJlbnQuZm9yRWFjaChyb3cgPT4ge1xuICAgICAgICAgICAgICAgIHJlbmRlckNvbGxhcHNpYmxlRGl2KHJvdyk7XG4gICAgICAgICAgICAgICAgbW92ZUNvbHVtbnNJbnNpZGVDb2xsYXBzaWJsZURpdihyb3cpO1xuICAgICAgICAgICAgICAgIHJlbmRlckNoZXZyb24ocm93KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjb25zdCBjaGV2cm9uQnRucyA9IFsuLi5kYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuYnRuLXRkLXJlc3AtY29sbGFwc2VcIildO1xuICAgICAgICAgICAgY2hldnJvbkJ0bnMuZm9yRWFjaChjaGV2cm9uQnRuID0+XG4gICAgICAgICAgICAgICAgY2hldnJvbkJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZXZlbnQgPT4gdG9nZ2xlVHJDb2xsYXBzZShldmVudCwgY2hldnJvbkJ0bikpXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gcmVzZXRDb2xsYXBzaWJsZXMoKSB7XG4gICAgICAgICAgICBjb25zdCBhbGxDb2xsYXBzaWJsZXMgPSBbLi4uZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnRyLXJlc3AtY29sbGFwc2libGVcIildO1xuICAgICAgICAgICAgYWxsQ29sbGFwc2libGVzLmZvckVhY2goY29sbGFwc2libGUgPT4gY29sbGFwc2libGUucmVtb3ZlKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gcmVzZXRIaWRkZW5Db2x1bW5zKCkge1xuICAgICAgICAgICAgY29uc3QgaGlkZGVuQ29sdW1ucyA9IFsuLi5kYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGguaGlkZGVuLCAudGQuaGlkZGVuXCIpXTtcbiAgICAgICAgICAgIGhpZGRlbkNvbHVtbnMuZm9yRWFjaChoaWRkZW5Db2x1bW4gPT4gaGlkZGVuQ29sdW1uLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIikpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gcmVzZXRDaGV2cm9ucygpIHtcbiAgICAgICAgICAgIGNvbnN0IHJvd3MgPSBbLi4uZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudC5xdWVyeVNlbGVjdG9yQWxsKCcudHJbcm9sZT1cInJvd1wiXScpXTtcbiAgICAgICAgICAgIHJvd3MuZm9yRWFjaChyb3cgPT4ge1xuICAgICAgICAgICAgICAgIHJvdy5xdWVyeVNlbGVjdG9yKFwiLnRoLmNoZXZyb24tdGhcIik/LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIHJvdy5xdWVyeVNlbGVjdG9yKFwiLnRkLmNoZXZyb24tdGRcIik/LnJlbW92ZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBvblNvcnQoKSB7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgd2luZG93LmlubmVyV2lkdGggPD0gbW9iaWxlQnJlYWtwb2ludCB8fFxuICAgICAgICAgICAgICAgICh3aW5kb3cuaW5uZXJXaWR0aCA+IG1vYmlsZUJyZWFrcG9pbnQgJiYgd2luZG93LmlubmVyV2lkdGggPCBkZXNrdG9wQnJlYWtwb2ludClcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXNldENvbGxhcHNpYmxlcygpO1xuICAgICAgICAgICAgICAgICAgICByZXNldEhpZGRlbkNvbHVtbnMoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzZXRDaGV2cm9ucygpO1xuICAgICAgICAgICAgICAgICAgICByZW5kZXJFbGVtZW50cygpO1xuICAgICAgICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2FuUmVuZGVyICYmIHNjcmVlbk1vZGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGhlYWRlcnMgPSBbLi4uZGF0YWdyaWRSb3dzUmVmLmN1cnJlbnRbMF0ucXVlcnlTZWxlY3RvckFsbChcIi50aFwiKV07XG5cbiAgICAgICAgICAgIC8vIEZvciBkZXNrdG9wIGxlYXZlIC8gcmVzdG9yZSBkZWZhdWx0LiBGb3Igb3RoZXIgc2l0dWF0aW9ucyB1cGRhdGUgdG8gbW9iaWxlIC8gdGFibGV0IGNvbHVtbnNcbiAgICAgICAgICAgIGlmIChzY3JlZW5Nb2RlID09PSBcImRlc2t0b3BcIikge1xuICAgICAgICAgICAgICAgIHRhYmxlQ29udGVudC5zZXRBdHRyaWJ1dGUoXCJzdHlsZVwiLCB0ZW1wbGF0ZUNvbHVtbnMpO1xuICAgICAgICAgICAgICAgIHJlc2V0Q29sbGFwc2libGVzKCk7XG4gICAgICAgICAgICAgICAgcmVzZXRIaWRkZW5Db2x1bW5zKCk7XG4gICAgICAgICAgICAgICAgcmVzZXRDaGV2cm9ucygpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZXRHcmlkQ29sdW1ucygpO1xuICAgICAgICAgICAgICAgIHJlc2V0Q29sbGFwc2libGVzKCk7XG4gICAgICAgICAgICAgICAgcmVzZXRIaWRkZW5Db2x1bW5zKCk7XG4gICAgICAgICAgICAgICAgcmVzZXRDaGV2cm9ucygpO1xuICAgICAgICAgICAgICAgIHJlbmRlckVsZW1lbnRzKCk7XG4gICAgICAgICAgICAgICAgaGVhZGVycy5mb3JFYWNoKGhlYWRlciA9PiBoZWFkZXIuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIG9uU29ydCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRGV0ZWN0IGEgY2hhbmdlIGluIERhdGEgZ3JpZCAyIGFmdGVyIHRoZSBpbml0aWFsIHJlbmRlcmluZyBvZiBldmVyeXRoaW5nXG4gICAgICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgaWYgKGRhdGFncmlkUm93c1JlZi5jdXJyZW50ICE9PSBkYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudHJbcm9sZT1yb3ddXCIpKSB7XG4gICAgICAgICAgICAgICAgZGF0YWdyaWRSb3dzUmVmLmN1cnJlbnQgPSBbLi4uZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnRyW3JvbGU9cm93XVwiKV07XG4gICAgICAgICAgICAgICAgaWYgKHNjcmVlbk1vZGUgIT09IFwiZGVza3RvcFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc2V0Q29sbGFwc2libGVzKCk7XG4gICAgICAgICAgICAgICAgICAgIHJlc2V0SGlkZGVuQ29sdW1ucygpO1xuICAgICAgICAgICAgICAgICAgICByZXNldENoZXZyb25zKCk7XG4gICAgICAgICAgICAgICAgICAgIHJlbmRlckVsZW1lbnRzKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQsIGNvbmZpZyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChkYXRhZ3JpZFdpZGdldFJlZiAmJiBkYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQsIGNvbmZpZyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKCkgPT4gb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgIH0pO1xuXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigoKSA9PiB7XG4gICAgICAgICAgICBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICBpZiAoZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudCkge1xuICAgICAgICAgICAgICAgIHNldFRhYmxlQ29udGVudChkYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2lkZ2V0LWRhdGFncmlkIC53aWRnZXQtZGF0YWdyaWQtZ3JpZC1ib2R5XCIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9ic2VydmVyLm9ic2VydmUoZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudCwgY29uZmlnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGRhdGFncmlkV2lkZ2V0UmVmICYmIGRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIG9ic2VydmVyLm9ic2VydmUoZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudCwgY29uZmlnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoKSA9PiBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgfSk7XG5cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBpZiAodGFibGVDb250ZW50KSB7XG4gICAgICAgICAgICBzZXRUZW1wbGF0ZUNvbHVtbnModGFibGVDb250ZW50LmdldEF0dHJpYnV0ZShcInN0eWxlXCIpKTtcbiAgICAgICAgICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA8PSBtb2JpbGVCcmVha3BvaW50KSB7XG4gICAgICAgICAgICAgICAgc2V0U2NlZW5Nb2RlKFwibW9iaWxlXCIpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA+IG1vYmlsZUJyZWFrcG9pbnQgJiYgd2luZG93LmlubmVyV2lkdGggPCBkZXNrdG9wQnJlYWtwb2ludCkge1xuICAgICAgICAgICAgICAgIHNldFNjZWVuTW9kZShcInRhYmxldFwiKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAod2luZG93LmlubmVyV2lkdGggPj0gZGVza3RvcEJyZWFrcG9pbnQpIHtcbiAgICAgICAgICAgICAgICBzZXRTY2Vlbk1vZGUoXCJkZXNrdG9wXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2V0Q2FuUmVuZGVyKHRydWUpO1xuICAgICAgICB9XG4gICAgfSwgW2Rlc2t0b3BCcmVha3BvaW50LCBtb2JpbGVCcmVha3BvaW50LCB0YWJsZUNvbnRlbnRdKTtcblxuICAgIGlmIChjYW5SZW5kZXIpIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgc2NyZWVuU2l6ZUNoZWNrKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YHJlc3BvbnNpdmUtZGF0YWdyaWQgJHtzdHlsZX1gfSByZWY9e2RhdGFncmlkV2lkZ2V0UmVmfT5cbiAgICAgICAgICAgIHtkYXRhR3JpZFdpZGdldH1cbiAgICAgICAgPC9kaXY+XG4gICAgKTtcbn1cbiJdLCJuYW1lcyI6WyJSZXNwb25zaXZlRGF0YWdyaWRUd28iLCJkYXRhR3JpZFdpZGdldCIsImRlc2t0b3BCcmVha3BvaW50Iiwia2VlcExhc3RCb29sZWFuIiwibWF4Q29sdW1uc01vYmlsZSIsIm1heENvbHVtbnNUYWJsZXQiLCJtb2JpbGVCcmVha3BvaW50IiwicmVzdCIsInN0eWxlIiwiY2xhc3MiLCJkYXRhZ3JpZFdpZGdldFJlZiIsInVzZVJlZiIsImRhdGFncmlkUm93c1JlZiIsInRhYmxlQ29udGVudCIsInNldFRhYmxlQ29udGVudCIsInVzZVN0YXRlIiwiY2FuUmVuZGVyIiwic2V0Q2FuUmVuZGVyIiwidGVtcGxhdGVDb2x1bW5zIiwic2V0VGVtcGxhdGVDb2x1bW5zIiwic2NyZWVuTW9kZSIsInNldFNjZWVuTW9kZSIsImNvbmZpZyIsImNoaWxkTGlzdCIsInN1YnRyZWUiLCJzY3JlZW5TaXplQ2hlY2siLCJ3aW5kb3ciLCJpbm5lcldpZHRoIiwidXNlRWZmZWN0Iiwic2V0R3JpZENvbHVtbnMiLCJvZmZzZXQiLCJjb2x1bW5BcnJheSIsInJlcGxhY2UiLCJzcGxpdCIsInZpc2libGVDb2x1bW5zIiwibWF4Q29sdW1uQXJyYXkiLCJzbGljZSIsImxlbmd0aCIsInB1c2giLCJqb2luIiwidW5zaGlmdCIsInNwbGljZSIsInNldEF0dHJpYnV0ZSIsInRvZ2dsZVRyQ29sbGFwc2UiLCJldmVudCIsImNoZXZyb25CdG4iLCJub3RDb2xsYXBzZWQiLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJmb3JFYWNoIiwiY2hldnJvblJvdyIsInJvd0J0biIsInBhcmVudEVsZW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwiY2xhc3NMaXN0IiwidG9nZ2xlIiwidGFyZ2V0IiwiY2xvc2VzdCIsInJlbmRlckNoZXZyb24iLCJyb3ciLCJzZWxlY3RUSCIsImV4dHJhVEgiLCJpbnNlcnRBZGphY2VudEhUTUwiLCJzZWxlY3RURCIsImJvcmRlckNsYXNzIiwiZXh0cmFURCIsInJlbmRlckNvbGxhcHNpYmxlRGl2IiwiY29sbGFwc2libGVEaXYiLCJtb3ZlQ29sdW1uc0luc2lkZUNvbGxhcHNpYmxlRGl2IiwiVEhzIiwiVEgiLCJhZGQiLCJURHMiLCJURCIsImluZGV4IiwiaGVhZGVycyIsImN1cnJlbnQiLCJjb2xsYXBzaWJsZSIsImNvbGxhcHNpYmxlQ29udGVudCIsImlubmVySFRNTCIsInJlbmRlckVsZW1lbnRzIiwiY2hldnJvbkJ0bnMiLCJhZGRFdmVudExpc3RlbmVyIiwicmVzZXRDb2xsYXBzaWJsZXMiLCJhbGxDb2xsYXBzaWJsZXMiLCJyZW1vdmUiLCJyZXNldEhpZGRlbkNvbHVtbnMiLCJoaWRkZW5Db2x1bW5zIiwiaGlkZGVuQ29sdW1uIiwicmVzZXRDaGV2cm9ucyIsInJvd3MiLCJvblNvcnQiLCJzZXRUaW1lb3V0IiwiaGVhZGVyIiwib2JzZXJ2ZXIiLCJNdXRhdGlvbk9ic2VydmVyIiwiZGlzY29ubmVjdCIsIm9ic2VydmUiLCJnZXRBdHRyaWJ1dGUiLCJjcmVhdGVFbGVtZW50IiwiY2xhc3NOYW1lIiwicmVmIl0sIm1hcHBpbmdzIjoiOztJQUdPLFNBQVNBLHFCQUFxQkEsQ0FBQztNQUNsQ0MsY0FBYztNQUNkQyxpQkFBaUI7TUFDakJDLGVBQWU7TUFDZkMsZ0JBQWdCO01BQ2hCQyxnQkFBZ0I7TUFDaEJDLGdCQUFnQjtNQUNoQixHQUFHQyxJQUFBQTtJQUNQLENBQUMsRUFBRTtJQUNDLEVBQUEsTUFBTUMsS0FBSyxHQUFHRCxJQUFJLENBQUNFLEtBQUssSUFBSSxFQUFFLENBQUE7SUFDOUIsRUFBQSxNQUFNQyxpQkFBaUIsR0FBR0MsWUFBTSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ3RDLEVBQUEsTUFBTUMsZUFBZSxHQUFHRCxZQUFNLENBQUMsRUFBRSxDQUFDLENBQUE7TUFDbEMsTUFBTSxDQUFDRSxZQUFZLEVBQUVDLGVBQWUsQ0FBQyxHQUFHQyxjQUFRLENBQUMsSUFBSSxDQUFDLENBQUE7TUFDdEQsTUFBTSxDQUFDQyxTQUFTLEVBQUVDLFlBQVksQ0FBQyxHQUFHRixjQUFRLENBQUMsS0FBSyxDQUFDLENBQUE7TUFDakQsTUFBTSxDQUFDRyxlQUFlLEVBQUVDLGtCQUFrQixDQUFDLEdBQUdKLGNBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtNQUM1RCxNQUFNLENBQUNLLFVBQVUsRUFBRUMsWUFBWSxDQUFDLEdBQUdOLGNBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUNqRCxFQUFBLE1BQU1PLE1BQU0sR0FBRztJQUNYO0lBQ0E7SUFDQUMsSUFBQUEsU0FBUyxFQUFFLElBQUk7SUFBRTtRQUNqQkMsT0FBTyxFQUFFLElBQUk7T0FDaEIsQ0FBQTtNQUVELFNBQVNDLGVBQWVBLEdBQUc7SUFDdkIsSUFBQSxJQUFJQyxNQUFNLENBQUNDLFVBQVUsSUFBSXJCLGdCQUFnQixFQUFFO1VBQ3ZDLElBQUljLFVBQVUsS0FBSyxRQUFRLEVBQUU7WUFDekJDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUMxQixPQUFBO0lBQ0osS0FBQyxNQUFNLElBQUlLLE1BQU0sQ0FBQ0MsVUFBVSxHQUFHckIsZ0JBQWdCLElBQUlvQixNQUFNLENBQUNDLFVBQVUsR0FBR3pCLGlCQUFpQixFQUFFO1VBQ3RGLElBQUlrQixVQUFVLEtBQUssUUFBUSxFQUFFO1lBQ3pCQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDMUIsT0FBQTtJQUNKLEtBQUMsTUFBTSxJQUFJSyxNQUFNLENBQUNDLFVBQVUsSUFBSXpCLGlCQUFpQixFQUFFO1VBQy9DLElBQUlrQixVQUFVLEtBQUssU0FBUyxFQUFFO1lBQzFCQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUE7SUFDM0IsT0FBQTtJQUNKLEtBQUE7SUFDSixHQUFBO0lBRUFPLEVBQUFBLGVBQVMsQ0FBQyxNQUFNO1FBQ1osU0FBU0MsY0FBY0EsR0FBRztJQUN0QixNQUFBLE1BQU1DLE1BQU0sR0FBRzNCLGVBQWUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDdkMsTUFBQSxNQUFNNEIsV0FBVyxHQUFHYixlQUFlLENBQUNjLE9BQU8sQ0FBQyx5QkFBeUIsRUFBRSxFQUFFLENBQUMsQ0FBQ0MsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1VBQ2xHLE1BQU1DLGNBQWMsR0FBR2QsVUFBVSxLQUFLLFFBQVEsR0FBR2hCLGdCQUFnQixHQUFHQyxnQkFBZ0IsQ0FBQTtJQUNwRixNQUFBLE1BQU04QixjQUFjLEdBQUdKLFdBQVcsQ0FBQ0ssS0FBSyxDQUFDTCxXQUFXLENBQUNNLE1BQU0sR0FBR0gsY0FBYyxHQUFHSixNQUFNLENBQUMsQ0FBQzs7SUFFdkYsTUFBQSxJQUFJQSxNQUFNLEVBQUU7SUFDUkssUUFBQUEsY0FBYyxDQUFDRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtJQUM1QyxPQUFBO1VBQ0FILGNBQWMsQ0FBQ0ksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDUCxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFBO0lBQ3pDRyxNQUFBQSxjQUFjLENBQUNLLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1VBQzVDTCxjQUFjLENBQUNNLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1VBQ25DNUIsWUFBWSxDQUFDNkIsWUFBWSxDQUFDLE9BQU8sRUFBRyxDQUF5QlAsdUJBQUFBLEVBQUFBLGNBQWMsQ0FBQ0ksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDUCxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBRSxHQUFFLENBQUMsQ0FBQTtJQUM5RyxLQUFBO0lBRUEsSUFBQSxTQUFTVyxnQkFBZ0JBLENBQUNDLEtBQUssRUFBRUMsVUFBVSxFQUFFO1VBQ3pDLE1BQU1DLFlBQVksR0FBRyxDQUNqQixHQUFHQyxRQUFRLENBQUNDLGdCQUFnQixDQUFDLDJEQUEyRCxDQUFDLENBQzVGLENBQUE7VUFDRCxJQUFJRixZQUFZLENBQUNULE1BQU0sRUFBRTtJQUNyQlMsUUFBQUEsWUFBWSxDQUFDRyxPQUFPLENBQUNDLFVBQVUsSUFBSTtjQUMvQixNQUFNQyxNQUFNLEdBQUdELFVBQVUsQ0FBQ0UsYUFBYSxDQUFDQyxhQUFhLENBQUMsdUJBQXVCLENBQUMsQ0FBQTtjQUM5RSxJQUFJRixNQUFNLEtBQUtOLFVBQVUsRUFBRTtJQUN2QkssWUFBQUEsVUFBVSxDQUFDSSxTQUFTLENBQUNDLE1BQU0sQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFBO0lBQzdETCxZQUFBQSxVQUFVLENBQUNFLGFBQWEsQ0FDbkJDLGFBQWEsQ0FBQyx1QkFBdUIsQ0FBQyxDQUN0Q0MsU0FBUyxDQUFDQyxNQUFNLENBQUMsOEJBQThCLENBQUMsQ0FBQTtJQUN6RCxXQUFBO0lBQ0osU0FBQyxDQUFDLENBQUE7SUFDTixPQUFBO0lBRUFWLE1BQUFBLFVBQVUsQ0FBQ1MsU0FBUyxDQUFDQyxNQUFNLENBQUMsOEJBQThCLENBQUMsQ0FBQTtJQUMzRFgsTUFBQUEsS0FBSyxDQUFDWSxNQUFNLENBQ1BDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FDZEosYUFBYSxDQUFDLHNCQUFzQixDQUFDLENBQ3JDQyxTQUFTLENBQUNDLE1BQU0sQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFBO0lBQzNELEtBQUE7O0lBRUE7UUFDQSxTQUFTRyxhQUFhQSxDQUFDQyxHQUFHLEVBQUU7SUFDeEI7SUFDQSxNQUFBLElBQUksQ0FBQ0EsR0FBRyxDQUFDTixhQUFhLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtJQUN0QyxRQUFBLE1BQU1PLFFBQVEsR0FBR0QsR0FBRyxDQUFDTixhQUFhLENBQUMsS0FBSyxDQUFDLENBQUE7WUFDekMsTUFBTVEsT0FBTyxHQUFJLENBQWdHLCtGQUFBLENBQUEsQ0FBQTtZQUNqSCxJQUFJRCxRQUFRLElBQUlBLFFBQVEsQ0FBQ1AsYUFBYSxDQUFDLG9CQUFvQixDQUFDLEVBQUU7SUFDMURPLFVBQUFBLFFBQVEsQ0FBQ0Usa0JBQWtCLENBQUMsVUFBVSxFQUFFRCxPQUFPLENBQUMsQ0FBQTthQUNuRCxNQUFNLElBQUlELFFBQVEsRUFBRTtJQUNqQkEsVUFBQUEsUUFBUSxDQUFDRSxrQkFBa0IsQ0FBQyxhQUFhLEVBQUVELE9BQU8sQ0FBQyxDQUFBO0lBQ3ZELFNBQUE7SUFDSixPQUFBOztJQUVBO0lBQ0EsTUFBQSxJQUFJLENBQUNGLEdBQUcsQ0FBQ04sYUFBYSxDQUFDLGdCQUFnQixDQUFDLEVBQUU7SUFDdEMsUUFBQSxNQUFNVSxRQUFRLEdBQUdKLEdBQUcsQ0FBQ04sYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFBO1lBQ3pDLE1BQU1XLFdBQVcsR0FBR0wsR0FBRyxDQUFDTixhQUFhLENBQUMsYUFBYSxDQUFDLEdBQUcsYUFBYSxHQUFHLEVBQUUsQ0FBQTtJQUN6RSxRQUFBLE1BQU1ZLE9BQU8sR0FBSSxDQUFpQkQsZUFBQUEsRUFBQUEsV0FBWSxDQUFxcUIsb3FCQUFBLENBQUEsQ0FBQTtZQUNudEIsSUFBSUQsUUFBUSxJQUFJQSxRQUFRLENBQUNWLGFBQWEsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFO0lBQzFEVSxVQUFBQSxRQUFRLENBQUNELGtCQUFrQixDQUFDLFVBQVUsRUFBRUcsT0FBTyxDQUFDLENBQUE7YUFDbkQsTUFBTSxJQUFJRixRQUFRLEVBQUU7SUFDakJBLFVBQUFBLFFBQVEsQ0FBQ0Qsa0JBQWtCLENBQUMsYUFBYSxFQUFFRyxPQUFPLENBQUMsQ0FBQTtJQUN2RCxTQUFBO0lBQ0osT0FBQTtJQUNKLEtBQUE7UUFFQSxTQUFTQyxvQkFBb0JBLENBQUNQLEdBQUcsRUFBRTtVQUMvQixNQUFNUSxjQUFjLEdBQUksQ0FBdUUsc0VBQUEsQ0FBQSxDQUFBO0lBQy9GLE1BQUEsSUFBSSxDQUFDUixHQUFHLENBQUNOLGFBQWEsQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFO0lBQzVDTSxRQUFBQSxHQUFHLENBQUNHLGtCQUFrQixDQUFDLFdBQVcsRUFBRUssY0FBYyxDQUFDLENBQUE7SUFDdkQsT0FBQTtJQUNKLEtBQUE7UUFFQSxTQUFTQywrQkFBK0JBLENBQUNULEdBQUcsRUFBRTtJQUMxQyxNQUFBLE1BQU03QixNQUFNLEdBQUczQixlQUFlLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1VBQ3ZDLE1BQU0rQixjQUFjLEdBQUdkLFVBQVUsS0FBSyxRQUFRLEdBQUdoQixnQkFBZ0IsR0FBR0MsZ0JBQWdCLENBQUE7VUFDcEYsTUFBTWdFLEdBQUcsR0FBRyxDQUFDLEdBQUdWLEdBQUcsQ0FBQ1gsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtVQUM1QyxJQUFJcUIsR0FBRyxDQUFDaEMsTUFBTSxFQUFFO1lBQ1pnQyxHQUFHLENBQUNqQyxLQUFLLENBQUNpQyxHQUFHLENBQUNoQyxNQUFNLElBQUlnQyxHQUFHLENBQUNoQyxNQUFNLEdBQUdILGNBQWMsQ0FBQyxHQUFHSixNQUFNLEVBQUVBLE1BQU0sQ0FBQyxDQUFDbUIsT0FBTyxDQUFDcUIsRUFBRSxJQUFJO0lBQ2pGQSxVQUFBQSxFQUFFLENBQUNoQixTQUFTLENBQUNpQixHQUFHLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDOUIsU0FBQyxDQUFDLENBQUE7SUFDTixPQUFBO1VBRUEsTUFBTUMsR0FBRyxHQUFHLENBQUMsR0FBR2IsR0FBRyxDQUFDWCxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO1VBQzVDLElBQUl3QixHQUFHLENBQUNuQyxNQUFNLEVBQUU7WUFDWm1DLEdBQUcsQ0FBQ3BDLEtBQUssQ0FBQ29DLEdBQUcsQ0FBQ25DLE1BQU0sSUFBSW1DLEdBQUcsQ0FBQ25DLE1BQU0sR0FBR0gsY0FBYyxDQUFDLEdBQUdKLE1BQU0sRUFBRUEsTUFBTSxDQUFDLENBQUNtQixPQUFPLENBQUMsQ0FBQ3dCLEVBQUUsRUFBRUMsS0FBSyxLQUFLO0lBQzFGRCxVQUFBQSxFQUFFLENBQUNuQixTQUFTLENBQUNpQixHQUFHLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDMUIsVUFBQSxNQUFNSSxPQUFPLEdBQUcsQ0FDWixHQUFHakUsaUJBQWlCLENBQUNrRSxPQUFPLENBQUM1QixnQkFBZ0IsQ0FDekMseURBQ0osQ0FBQyxDQUNKLENBQUE7SUFDRCxVQUFBLE1BQU02QixXQUFXLEdBQUdsQixHQUFHLENBQUNOLGFBQWEsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFBO0lBQzdELFVBQUEsTUFBTXlCLGtCQUFrQixHQUFJLENBQUE7QUFDaEQsOERBQWdFSCxFQUFBQSxPQUFPLENBQUNELEtBQUssQ0FBQyxFQUFFckIsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDMEIsU0FBVSxDQUFBO0FBQ2hILGtEQUFBLEVBQW9ETixFQUFFLENBQUNwQixhQUFhLENBQUMsTUFBTSxDQUFDLEVBQUUwQixTQUFVLENBQUE7QUFDeEYsOEJBQStCLENBQUEsQ0FBQTtJQUNYRixVQUFBQSxXQUFXLENBQUNmLGtCQUFrQixDQUFDLFdBQVcsRUFBRWdCLGtCQUFrQixDQUFDLENBQUE7SUFDbkUsU0FBQyxDQUFDLENBQUE7SUFDTixPQUFBO0lBQ0osS0FBQTtRQUVBLFNBQVNFLGNBQWNBLEdBQUc7SUFDdEI7SUFDQXBFLE1BQUFBLGVBQWUsQ0FBQ2dFLE9BQU8sQ0FBQzNCLE9BQU8sQ0FBQ1UsR0FBRyxJQUFJO1lBQ25DTyxvQkFBb0IsQ0FBQ1AsR0FBRyxDQUFDLENBQUE7WUFDekJTLCtCQUErQixDQUFDVCxHQUFHLENBQUMsQ0FBQTtZQUNwQ0QsYUFBYSxDQUFDQyxHQUFHLENBQUMsQ0FBQTtJQUN0QixPQUFDLENBQUMsQ0FBQTtJQUVGLE1BQUEsTUFBTXNCLFdBQVcsR0FBRyxDQUFDLEdBQUd2RSxpQkFBaUIsQ0FBQ2tFLE9BQU8sQ0FBQzVCLGdCQUFnQixDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQTtVQUM1RmlDLFdBQVcsQ0FBQ2hDLE9BQU8sQ0FBQ0osVUFBVSxJQUMxQkEsVUFBVSxDQUFDcUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFdEMsS0FBSyxJQUFJRCxnQkFBZ0IsQ0FBQ0MsS0FBSyxFQUFFQyxVQUFVLENBQUMsQ0FDckYsQ0FBQyxDQUFBO0lBQ0wsS0FBQTtRQUVBLFNBQVNzQyxpQkFBaUJBLEdBQUc7SUFDekIsTUFBQSxNQUFNQyxlQUFlLEdBQUcsQ0FBQyxHQUFHMUUsaUJBQWlCLENBQUNrRSxPQUFPLENBQUM1QixnQkFBZ0IsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUE7VUFDL0ZvQyxlQUFlLENBQUNuQyxPQUFPLENBQUM0QixXQUFXLElBQUlBLFdBQVcsQ0FBQ1EsTUFBTSxFQUFFLENBQUMsQ0FBQTtJQUNoRSxLQUFBO1FBRUEsU0FBU0Msa0JBQWtCQSxHQUFHO0lBQzFCLE1BQUEsTUFBTUMsYUFBYSxHQUFHLENBQUMsR0FBRzdFLGlCQUFpQixDQUFDa0UsT0FBTyxDQUFDNUIsZ0JBQWdCLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFBO0lBQy9GdUMsTUFBQUEsYUFBYSxDQUFDdEMsT0FBTyxDQUFDdUMsWUFBWSxJQUFJQSxZQUFZLENBQUNsQyxTQUFTLENBQUMrQixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQTtJQUNsRixLQUFBO1FBRUEsU0FBU0ksYUFBYUEsR0FBRztJQUNyQixNQUFBLE1BQU1DLElBQUksR0FBRyxDQUFDLEdBQUdoRixpQkFBaUIsQ0FBQ2tFLE9BQU8sQ0FBQzVCLGdCQUFnQixDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQTtJQUMvRTBDLE1BQUFBLElBQUksQ0FBQ3pDLE9BQU8sQ0FBQ1UsR0FBRyxJQUFJO1lBQ2hCQSxHQUFHLENBQUNOLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFZ0MsTUFBTSxFQUFFLENBQUE7WUFDN0MxQixHQUFHLENBQUNOLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFZ0MsTUFBTSxFQUFFLENBQUE7SUFDakQsT0FBQyxDQUFDLENBQUE7SUFDTixLQUFBO1FBRUEsU0FBU00sTUFBTUEsR0FBRztJQUNkLE1BQUEsSUFDSWpFLE1BQU0sQ0FBQ0MsVUFBVSxJQUFJckIsZ0JBQWdCLElBQ3BDb0IsTUFBTSxDQUFDQyxVQUFVLEdBQUdyQixnQkFBZ0IsSUFBSW9CLE1BQU0sQ0FBQ0MsVUFBVSxHQUFHekIsaUJBQWtCLEVBQ2pGO0lBQ0UwRixRQUFBQSxVQUFVLENBQUMsTUFBTTtJQUNiVCxVQUFBQSxpQkFBaUIsRUFBRSxDQUFBO0lBQ25CRyxVQUFBQSxrQkFBa0IsRUFBRSxDQUFBO0lBQ3BCRyxVQUFBQSxhQUFhLEVBQUUsQ0FBQTtJQUNmVCxVQUFBQSxjQUFjLEVBQUUsQ0FBQTthQUNuQixFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ1gsT0FBQTtJQUNKLEtBQUE7UUFFQSxJQUFJaEUsU0FBUyxJQUFJSSxVQUFVLEVBQUU7SUFDekIsTUFBQSxNQUFNdUQsT0FBTyxHQUFHLENBQUMsR0FBRy9ELGVBQWUsQ0FBQ2dFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQzVCLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7O0lBRXZFO1VBQ0EsSUFBSTVCLFVBQVUsS0FBSyxTQUFTLEVBQUU7SUFDMUJQLFFBQUFBLFlBQVksQ0FBQzZCLFlBQVksQ0FBQyxPQUFPLEVBQUV4QixlQUFlLENBQUMsQ0FBQTtJQUNuRGlFLFFBQUFBLGlCQUFpQixFQUFFLENBQUE7SUFDbkJHLFFBQUFBLGtCQUFrQixFQUFFLENBQUE7SUFDcEJHLFFBQUFBLGFBQWEsRUFBRSxDQUFBO0lBQ25CLE9BQUMsTUFBTTtJQUNINUQsUUFBQUEsY0FBYyxFQUFFLENBQUE7SUFDaEJzRCxRQUFBQSxpQkFBaUIsRUFBRSxDQUFBO0lBQ25CRyxRQUFBQSxrQkFBa0IsRUFBRSxDQUFBO0lBQ3BCRyxRQUFBQSxhQUFhLEVBQUUsQ0FBQTtJQUNmVCxRQUFBQSxjQUFjLEVBQUUsQ0FBQTtJQUNoQkwsUUFBQUEsT0FBTyxDQUFDMUIsT0FBTyxDQUFDNEMsTUFBTSxJQUFJQSxNQUFNLENBQUNYLGdCQUFnQixDQUFDLE9BQU8sRUFBRVMsTUFBTSxDQUFDLENBQUMsQ0FBQTtJQUN2RSxPQUFBO0lBQ0osS0FBQTs7SUFFQTtJQUNBLElBQUEsTUFBTUcsUUFBUSxHQUFHLElBQUlDLGdCQUFnQixDQUFDLE1BQU07VUFDeENELFFBQVEsQ0FBQ0UsVUFBVSxFQUFFLENBQUE7SUFDckIsTUFBQSxJQUFJcEYsZUFBZSxDQUFDZ0UsT0FBTyxLQUFLbEUsaUJBQWlCLENBQUNrRSxPQUFPLENBQUM1QixnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsRUFBRTtJQUN6RnBDLFFBQUFBLGVBQWUsQ0FBQ2dFLE9BQU8sR0FBRyxDQUFDLEdBQUdsRSxpQkFBaUIsQ0FBQ2tFLE9BQU8sQ0FBQzVCLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUE7WUFDMUYsSUFBSTVCLFVBQVUsS0FBSyxTQUFTLEVBQUU7SUFDMUIrRCxVQUFBQSxpQkFBaUIsRUFBRSxDQUFBO0lBQ25CRyxVQUFBQSxrQkFBa0IsRUFBRSxDQUFBO0lBQ3BCRyxVQUFBQSxhQUFhLEVBQUUsQ0FBQTtJQUNmVCxVQUFBQSxjQUFjLEVBQUUsQ0FBQTtJQUNwQixTQUFBO0lBQ0osT0FBQTtVQUVBYyxRQUFRLENBQUNHLE9BQU8sQ0FBQ3ZGLGlCQUFpQixDQUFDa0UsT0FBTyxFQUFFdEQsTUFBTSxDQUFDLENBQUE7SUFDdkQsS0FBQyxDQUFDLENBQUE7SUFFRixJQUFBLElBQUlaLGlCQUFpQixJQUFJQSxpQkFBaUIsQ0FBQ2tFLE9BQU8sRUFBRTtVQUNoRGtCLFFBQVEsQ0FBQ0csT0FBTyxDQUFDdkYsaUJBQWlCLENBQUNrRSxPQUFPLEVBQUV0RCxNQUFNLENBQUMsQ0FBQTtJQUN2RCxLQUFBO0lBRUEsSUFBQSxPQUFPLE1BQU13RSxRQUFRLENBQUNFLFVBQVUsRUFBRSxDQUFBO0lBQ3RDLEdBQUMsQ0FBQyxDQUFBO0lBRUZwRSxFQUFBQSxlQUFTLENBQUMsTUFBTTtJQUNaLElBQUEsTUFBTWtFLFFBQVEsR0FBRyxJQUFJQyxnQkFBZ0IsQ0FBQyxNQUFNO1VBQ3hDRCxRQUFRLENBQUNFLFVBQVUsRUFBRSxDQUFBO1VBQ3JCLElBQUl0RixpQkFBaUIsQ0FBQ2tFLE9BQU8sRUFBRTtZQUMzQjlELGVBQWUsQ0FBQ0osaUJBQWlCLENBQUNrRSxPQUFPLENBQUN2QixhQUFhLENBQUMsNkNBQTZDLENBQUMsQ0FBQyxDQUFBO0lBQzNHLE9BQUE7VUFDQXlDLFFBQVEsQ0FBQ0csT0FBTyxDQUFDdkYsaUJBQWlCLENBQUNrRSxPQUFPLEVBQUV0RCxNQUFNLENBQUMsQ0FBQTtJQUN2RCxLQUFDLENBQUMsQ0FBQTtJQUVGLElBQUEsSUFBSVosaUJBQWlCLElBQUlBLGlCQUFpQixDQUFDa0UsT0FBTyxFQUFFO1VBQ2hEa0IsUUFBUSxDQUFDRyxPQUFPLENBQUN2RixpQkFBaUIsQ0FBQ2tFLE9BQU8sRUFBRXRELE1BQU0sQ0FBQyxDQUFBO0lBQ3ZELEtBQUE7SUFFQSxJQUFBLE9BQU8sTUFBTXdFLFFBQVEsQ0FBQ0UsVUFBVSxFQUFFLENBQUE7SUFDdEMsR0FBQyxDQUFDLENBQUE7SUFFRnBFLEVBQUFBLGVBQVMsQ0FBQyxNQUFNO0lBQ1osSUFBQSxJQUFJZixZQUFZLEVBQUU7SUFDZE0sTUFBQUEsa0JBQWtCLENBQUNOLFlBQVksQ0FBQ3FGLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFBO0lBQ3RELE1BQUEsSUFBSXhFLE1BQU0sQ0FBQ0MsVUFBVSxJQUFJckIsZ0JBQWdCLEVBQUU7WUFDdkNlLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUMxQixPQUFDLE1BQU0sSUFBSUssTUFBTSxDQUFDQyxVQUFVLEdBQUdyQixnQkFBZ0IsSUFBSW9CLE1BQU0sQ0FBQ0MsVUFBVSxHQUFHekIsaUJBQWlCLEVBQUU7WUFDdEZtQixZQUFZLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDMUIsT0FBQyxNQUFNLElBQUlLLE1BQU0sQ0FBQ0MsVUFBVSxJQUFJekIsaUJBQWlCLEVBQUU7WUFDL0NtQixZQUFZLENBQUMsU0FBUyxDQUFDLENBQUE7SUFDM0IsT0FBQTtVQUNBSixZQUFZLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDdEIsS0FBQTtPQUNILEVBQUUsQ0FBQ2YsaUJBQWlCLEVBQUVJLGdCQUFnQixFQUFFTyxZQUFZLENBQUMsQ0FBQyxDQUFBO0lBRXZELEVBQUEsSUFBSUcsU0FBUyxFQUFFO0lBQ1hVLElBQUFBLE1BQU0sQ0FBQ3dELGdCQUFnQixDQUFDLFFBQVEsRUFBRXpELGVBQWUsQ0FBQyxDQUFBO0lBQ3RELEdBQUE7SUFFQSxFQUFBLE9BQ0kwRSxtQkFBQSxDQUFBLEtBQUEsRUFBQTtRQUFLQyxTQUFTLEVBQUcsQ0FBc0I1RixvQkFBQUEsRUFBQUEsS0FBTSxDQUFFLENBQUE7SUFBQzZGLElBQUFBLEdBQUcsRUFBRTNGLGlCQUFBQTtJQUFrQixHQUFBLEVBQ2xFVCxjQUNBLENBQUMsQ0FBQTtJQUVkOzs7Ozs7Ozs7OyJ9
