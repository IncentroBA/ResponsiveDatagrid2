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
          setTimeout(() => {
            resetCollapsibles();
            resetHiddenColumns();
            resetChevrons();
            renderElements();
          }, 100);
        }
        function checkForSorting() {
          const rows = [...datagridWidgetRef.current.querySelectorAll(".tr[role=row]")];
          const headers = [...rows[0].querySelectorAll(".th")];
          headers.forEach(header => header.addEventListener("click", onSort));
        }
        if (canRender && screenMode) {
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
            checkForSorting();
          }
        }
        if (screenMode !== "desktop") {
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
                checkForSorting();
              }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzcG9uc2l2ZURhdGFncmlkVHdvLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvUmVzcG9uc2l2ZURhdGFncmlkVHdvLmpzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgXCIuL3VpL1Jlc3BvbnNpdmVEYXRhZ3JpZFR3by5jc3NcIjtcbmltcG9ydCB7IGNyZWF0ZUVsZW1lbnQsIHVzZUVmZmVjdCwgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuXG5leHBvcnQgZnVuY3Rpb24gUmVzcG9uc2l2ZURhdGFncmlkVHdvKHtcbiAgICBkYXRhR3JpZFdpZGdldCxcbiAgICBkZXNrdG9wQnJlYWtwb2ludCxcbiAgICBrZWVwTGFzdEJvb2xlYW4sXG4gICAgbWF4Q29sdW1uc01vYmlsZSxcbiAgICBtYXhDb2x1bW5zVGFibGV0LFxuICAgIG1vYmlsZUJyZWFrcG9pbnQsXG4gICAgLi4ucmVzdFxufSkge1xuICAgIGNvbnN0IHN0eWxlID0gcmVzdC5jbGFzcyB8fCBcIlwiO1xuICAgIGNvbnN0IGRhdGFncmlkV2lkZ2V0UmVmID0gdXNlUmVmKG51bGwpO1xuICAgIGNvbnN0IGRhdGFncmlkUm93c1JlZiA9IHVzZVJlZihbXSk7XG4gICAgY29uc3QgW3RhYmxlQ29udGVudCwgc2V0VGFibGVDb250ZW50XSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtjYW5SZW5kZXIsIHNldENhblJlbmRlcl0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3QgW3RlbXBsYXRlQ29sdW1ucywgc2V0VGVtcGxhdGVDb2x1bW5zXSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtzY3JlZW5Nb2RlLCBzZXRTY2Vlbk1vZGVdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgY29uZmlnID0ge1xuICAgICAgICAvLyBhdHRyaWJ1dGVzOiB0cnVlLFxuICAgICAgICAvLyBhdHRyaWJ1dGVPbGRWYWx1ZTogdHJ1ZSxcbiAgICAgICAgY2hpbGRMaXN0OiB0cnVlLCAvLyBUaGlzIGlzIGEgbXVzdCBoYXZlIGZvciB0aGUgb2JzZXJ2ZXIgd2l0aCBzdWJ0cmVlXG4gICAgICAgIHN1YnRyZWU6IHRydWUgLy8gU2V0IHRvIHRydWUgaWYgY2hhbmdlcyBtdXN0IGFsc28gYmUgb2JzZXJ2ZWQgaW4gZGVzY2VuZGFudHMuXG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIHNjcmVlblNpemVDaGVjaygpIHtcbiAgICAgICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoIDw9IG1vYmlsZUJyZWFrcG9pbnQpIHtcbiAgICAgICAgICAgIGlmIChzY3JlZW5Nb2RlICE9PSBcIm1vYmlsZVwiKSB7XG4gICAgICAgICAgICAgICAgc2V0U2NlZW5Nb2RlKFwibW9iaWxlXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHdpbmRvdy5pbm5lcldpZHRoID4gbW9iaWxlQnJlYWtwb2ludCAmJiB3aW5kb3cuaW5uZXJXaWR0aCA8IGRlc2t0b3BCcmVha3BvaW50KSB7XG4gICAgICAgICAgICBpZiAoc2NyZWVuTW9kZSAhPT0gXCJ0YWJsZXRcIikge1xuICAgICAgICAgICAgICAgIHNldFNjZWVuTW9kZShcInRhYmxldFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA+PSBkZXNrdG9wQnJlYWtwb2ludCkge1xuICAgICAgICAgICAgaWYgKHNjcmVlbk1vZGUgIT09IFwiZGVza3RvcFwiKSB7XG4gICAgICAgICAgICAgICAgc2V0U2NlZW5Nb2RlKFwiZGVza3RvcFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGZ1bmN0aW9uIHNldEdyaWRDb2x1bW5zKCkge1xuICAgICAgICAgICAgY29uc3Qgb2Zmc2V0ID0ga2VlcExhc3RCb29sZWFuID8gLTEgOiAwO1xuICAgICAgICAgICAgY29uc3QgY29sdW1uQXJyYXkgPSB0ZW1wbGF0ZUNvbHVtbnMucmVwbGFjZShcImdyaWQtdGVtcGxhdGUtY29sdW1uczogXCIsIFwiXCIpLnNwbGl0KC8gKD8hW14oKV0qXFwpKS8pOyAvLyBSZWdleCBmb3Igc3BhY2Ugd2hlbiBub3QgaW5zaWRlICgpXG4gICAgICAgICAgICBjb25zdCB2aXNpYmxlQ29sdW1ucyA9IHNjcmVlbk1vZGUgPT09IFwibW9iaWxlXCIgPyBtYXhDb2x1bW5zTW9iaWxlIDogbWF4Q29sdW1uc1RhYmxldDtcbiAgICAgICAgICAgIGNvbnN0IG1heENvbHVtbkFycmF5ID0gY29sdW1uQXJyYXkuc2xpY2UoY29sdW1uQXJyYXkubGVuZ3RoIC0gdmlzaWJsZUNvbHVtbnMgLSBvZmZzZXQpOyAvLyByZW1vdmUgYWxsIGJ1dCB0aGUgbGFzdCBtYXhDb2x1bW5zTW9iaWxlXG5cbiAgICAgICAgICAgIGlmIChvZmZzZXQpIHtcbiAgICAgICAgICAgICAgICBtYXhDb2x1bW5BcnJheS5wdXNoKFwiZml0LWNvbnRlbnQoMTAwJSlcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtYXhDb2x1bW5BcnJheS5qb2luKFwiIFwiKS5yZXBsYWNlKFwiO1wiLCBcIlwiKTtcbiAgICAgICAgICAgIG1heENvbHVtbkFycmF5LnVuc2hpZnQoXCJmaXQtY29udGVudCgxMDAlKVwiKTsgLy8gYWRkIG5ldyBjb2x1bW4gZm9yIHRoZSBjaGV2cm9uXG4gICAgICAgICAgICBtYXhDb2x1bW5BcnJheS5zcGxpY2UoMiwgMSwgXCIxZnJcIik7IC8vIGNvbnZlcnQgYXQgbGVhc3Qgb25lIGF1dG8tZmlsbCBjb2x1bW4gdG8gYXV0by1maWxsXG4gICAgICAgICAgICB0YWJsZUNvbnRlbnQuc2V0QXR0cmlidXRlKFwic3R5bGVcIiwgYGdyaWQtdGVtcGxhdGUtY29sdW1uczogJHttYXhDb2x1bW5BcnJheS5qb2luKFwiIFwiKS5yZXBsYWNlKFwiO1wiLCBcIlwiKX07YCk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiB0b2dnbGVUckNvbGxhcHNlKGV2ZW50LCBjaGV2cm9uQnRuKSB7XG4gICAgICAgICAgICBjb25zdCBub3RDb2xsYXBzZWQgPSBbXG4gICAgICAgICAgICAgICAgLi4uZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi50ci1yZXNwLWNvbGxhcHNpYmxlOm5vdCgudHItcmVzcC1jb2xsYXBzaWJsZS0tY29sbGFwc2VkKVwiKVxuICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIGlmIChub3RDb2xsYXBzZWQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgbm90Q29sbGFwc2VkLmZvckVhY2goY2hldnJvblJvdyA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJvd0J0biA9IGNoZXZyb25Sb3cucGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmJ0bi10ZC1yZXNwLWNvbGxhcHNlXCIpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocm93QnRuICE9PSBjaGV2cm9uQnRuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGV2cm9uUm93LmNsYXNzTGlzdC50b2dnbGUoXCJ0ci1yZXNwLWNvbGxhcHNpYmxlLS1jb2xsYXBzZWRcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGV2cm9uUm93LnBhcmVudEVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucXVlcnlTZWxlY3RvcihcIi5idG4tdGQtcmVzcC1jb2xsYXBzZVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jbGFzc0xpc3QudG9nZ2xlKFwiYnRuLXRkLXJlc3AtY29sbGFwc2UtLWFjdGl2ZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjaGV2cm9uQnRuLmNsYXNzTGlzdC50b2dnbGUoXCJidG4tdGQtcmVzcC1jb2xsYXBzZS0tYWN0aXZlXCIpO1xuICAgICAgICAgICAgZXZlbnQudGFyZ2V0XG4gICAgICAgICAgICAgICAgLmNsb3Nlc3QoXCIudHJcIilcbiAgICAgICAgICAgICAgICAucXVlcnlTZWxlY3RvcihcIi50ci1yZXNwLWNvbGxhcHNpYmxlXCIpXG4gICAgICAgICAgICAgICAgLmNsYXNzTGlzdC50b2dnbGUoXCJ0ci1yZXNwLWNvbGxhcHNpYmxlLS1jb2xsYXBzZWRcIik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDaGVjayB0aGUgY29sdW1uIHRvIGluc2VydCB0aGUgY2hldnJvblxuICAgICAgICBmdW5jdGlvbiByZW5kZXJDaGV2cm9uKHJvdykge1xuICAgICAgICAgICAgLy8gQ2hlY2sgZmlyc3QgVEggaWYgdGhlcmUgaXMgbm8gY2hldnJvbiBwcmVzZW50XG4gICAgICAgICAgICBpZiAoIXJvdy5xdWVyeVNlbGVjdG9yKFwiLnRoLmNoZXZyb24tdGhcIikpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzZWxlY3RUSCA9IHJvdy5xdWVyeVNlbGVjdG9yKFwiLnRoXCIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGV4dHJhVEggPSBgPGRpdiBjbGFzcz1cInRoIGNoZXZyb24tdGhcIiByb2xlPVwiY29sdW1uaGVhZGVyXCI+PGRpdiBjbGFzcz1cImNvbHVtbi1jb250YWluZXJcIj4mbmJzcDs8L2Rpdj48L2Rpdj5gO1xuICAgICAgICAgICAgICAgIGlmIChzZWxlY3RUSCAmJiBzZWxlY3RUSC5xdWVyeVNlbGVjdG9yKFwiLnRkLWN1c3RvbS1jb250ZW50XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdFRILmluc2VydEFkamFjZW50SFRNTChcImFmdGVyZW5kXCIsIGV4dHJhVEgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc2VsZWN0VEgpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0VEguaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYmVmb3JlYmVnaW5cIiwgZXh0cmFUSCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDaGVjayBmaXJzdCBURCBpZiB0aGVyZSBpcyBubyBjaGV2cm9uIHByZXNlbnRcbiAgICAgICAgICAgIGlmICghcm93LnF1ZXJ5U2VsZWN0b3IoXCIudGQuY2hldnJvbi10ZFwiKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNlbGVjdFREID0gcm93LnF1ZXJ5U2VsZWN0b3IoXCIudGRcIik7XG4gICAgICAgICAgICAgICAgY29uc3QgYm9yZGVyQ2xhc3MgPSByb3cucXVlcnlTZWxlY3RvcihcIi50ZC1ib3JkZXJzXCIpID8gXCJ0ZC1ib3JkZXJzIFwiIDogXCJcIjtcbiAgICAgICAgICAgICAgICBjb25zdCBleHRyYVREID0gYDxkaXYgY2xhc3M9XCJ0ZCAke2JvcmRlckNsYXNzfWNoZXZyb24tdGQgYnRuLXRkLXJlc3AtY29sbGFwc2VcIiByb2xlPVwiZ3JpZGNlbGxcIj48ZGl2IGNsYXNzPVwidGQtY3VzdG9tLWNvbnRlbnRcIj48c3ZnIGhlaWdodD1cIjE2XCIgd2lkdGg9XCIxNlwiIHZpZXdCb3g9XCIwIDAgMTYgMTZcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgZmlsbD1cImN1cnJlbnRDb2xvclwiPjxwYXRoIGQ9XCJNOC4wMDAwNCAxMS4xMzY5QzguMjEwMzMgMTEuMTM2OSA4LjM4NzQxIDExLjA1MzkgOC41NDc4OSAxMC44OTM0TDEyLjQ5MzUgNi44NTM2OEMxMi42MjA4IDYuNzIwODcgMTIuNjg3MiA2LjU2NTkyIDEyLjY4NzIgNi4zNzc3N0MxMi42ODcyIDUuOTkwNCAxMi4zODI5IDUuNjg2MDQgMTIuMDA2NiA1LjY4NjA0QzExLjgyMzkgNS42ODYwNCAxMS42NDY5IDUuNzYzNTEgMTEuNTA4NSA1LjkwMTg2TDguMDA1NTcgOS41MDQzOUw0LjQ5MTU4IDUuOTAxODZDNC4zNTg3NiA1Ljc2OTA0IDQuMTg3MjIgNS42ODYwNCAzLjk5MzUzIDUuNjg2MDRDMy42MTcyMyA1LjY4NjA0IDMuMzEyODcgNS45OTA0IDMuMzEyODcgNi4zNzc3N0MzLjMxMjg3IDYuNTYwMzggMy4zODQ4MSA2LjcyMDg3IDMuNTEyMDggNi44NTM2OEw3LjQ1NzcyIDEwLjg5MzRDNy42MjM3NCAxMS4wNTk0IDcuNzk1MjkgMTEuMTM2OSA4LjAwMDA0IDExLjEzNjlaXCIvPjwvc3ZnPjwvZGl2PjwvZGl2PmA7XG4gICAgICAgICAgICAgICAgaWYgKHNlbGVjdFREICYmIHNlbGVjdFRELnF1ZXJ5U2VsZWN0b3IoXCIudGQtY3VzdG9tLWNvbnRlbnRcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0VEQuaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYWZ0ZXJlbmRcIiwgZXh0cmFURCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzZWxlY3RURCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3RURC5pbnNlcnRBZGphY2VudEhUTUwoXCJiZWZvcmViZWdpblwiLCBleHRyYVREKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiByZW5kZXJDb2xsYXBzaWJsZURpdihyb3cpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbGxhcHNpYmxlRGl2ID0gYDxkaXYgY2xhc3M9XCJ0ci1yZXNwLWNvbGxhcHNpYmxlIHRyLXJlc3AtY29sbGFwc2libGUtLWNvbGxhcHNlZFwiPjwvZGl2PmA7XG4gICAgICAgICAgICBpZiAoIXJvdy5xdWVyeVNlbGVjdG9yKFwiLnRyLXJlc3AtY29sbGFwc2libGVcIikpIHtcbiAgICAgICAgICAgICAgICByb3cuaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYmVmb3JlZW5kXCIsIGNvbGxhcHNpYmxlRGl2KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIG1vdmVDb2x1bW5zSW5zaWRlQ29sbGFwc2libGVEaXYocm93KSB7XG4gICAgICAgICAgICBjb25zdCBvZmZzZXQgPSBrZWVwTGFzdEJvb2xlYW4gPyAtMSA6IDA7XG4gICAgICAgICAgICBjb25zdCB2aXNpYmxlQ29sdW1ucyA9IHNjcmVlbk1vZGUgPT09IFwibW9iaWxlXCIgPyBtYXhDb2x1bW5zTW9iaWxlIDogbWF4Q29sdW1uc1RhYmxldDtcbiAgICAgICAgICAgIGNvbnN0IFRIcyA9IFsuLi5yb3cucXVlcnlTZWxlY3RvckFsbChcIi50aFwiKV07XG4gICAgICAgICAgICBpZiAoVEhzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIFRIcy5zbGljZShUSHMubGVuZ3RoIC0gKFRIcy5sZW5ndGggLSB2aXNpYmxlQ29sdW1ucykgKyBvZmZzZXQsIG9mZnNldCkuZm9yRWFjaChUSCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIFRILmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IFREcyA9IFsuLi5yb3cucXVlcnlTZWxlY3RvckFsbChcIi50ZFwiKV07XG4gICAgICAgICAgICBpZiAoVERzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIFREcy5zbGljZShURHMubGVuZ3RoIC0gKFREcy5sZW5ndGggLSB2aXNpYmxlQ29sdW1ucykgKyBvZmZzZXQsIG9mZnNldCkuZm9yRWFjaCgoVEQsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIFRELmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhlYWRlcnMgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5kYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJy53aWRnZXQtZGF0YWdyaWQgLnRyW3JvbGU9XCJyb3dcIl06Zmlyc3QtY2hpbGQgLnRoLmhpZGRlbidcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sbGFwc2libGUgPSByb3cucXVlcnlTZWxlY3RvcihcIi50ci1yZXNwLWNvbGxhcHNpYmxlXCIpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb2xsYXBzaWJsZUNvbnRlbnQgPSBgPGRpdiBjbGFzcz1cInRyLXJlc3AtY29sbGFwc2libGVfX2l0ZW1cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwidGQtdGV4dCB0ZXh0LWJvbGQgbm9tYXJnaW5cIj4ke2hlYWRlcnNbaW5kZXhdPy5xdWVyeVNlbGVjdG9yKFwic3BhblwiKS5pbm5lckhUTUx9PC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidGQtdGV4dFwiPiR7VEQucXVlcnlTZWxlY3RvcihcInNwYW5cIik/LmlubmVySFRNTH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5gO1xuICAgICAgICAgICAgICAgICAgICBjb2xsYXBzaWJsZS5pbnNlcnRBZGphY2VudEhUTUwoXCJiZWZvcmVlbmRcIiwgY29sbGFwc2libGVDb250ZW50KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHJlbmRlckVsZW1lbnRzKCkge1xuICAgICAgICAgICAgLy8gUHJvY2VzcyBlYWNoIHJvd1xuICAgICAgICAgICAgZGF0YWdyaWRSb3dzUmVmLmN1cnJlbnQuZm9yRWFjaChyb3cgPT4ge1xuICAgICAgICAgICAgICAgIHJlbmRlckNvbGxhcHNpYmxlRGl2KHJvdyk7XG4gICAgICAgICAgICAgICAgbW92ZUNvbHVtbnNJbnNpZGVDb2xsYXBzaWJsZURpdihyb3cpO1xuICAgICAgICAgICAgICAgIHJlbmRlckNoZXZyb24ocm93KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjb25zdCBjaGV2cm9uQnRucyA9IFsuLi5kYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuYnRuLXRkLXJlc3AtY29sbGFwc2VcIildO1xuICAgICAgICAgICAgY2hldnJvbkJ0bnMuZm9yRWFjaChjaGV2cm9uQnRuID0+XG4gICAgICAgICAgICAgICAgY2hldnJvbkJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZXZlbnQgPT4gdG9nZ2xlVHJDb2xsYXBzZShldmVudCwgY2hldnJvbkJ0bikpXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gcmVzZXRDb2xsYXBzaWJsZXMoKSB7XG4gICAgICAgICAgICBjb25zdCBhbGxDb2xsYXBzaWJsZXMgPSBbLi4uZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnRyLXJlc3AtY29sbGFwc2libGVcIildO1xuICAgICAgICAgICAgYWxsQ29sbGFwc2libGVzLmZvckVhY2goY29sbGFwc2libGUgPT4gY29sbGFwc2libGUucmVtb3ZlKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gcmVzZXRIaWRkZW5Db2x1bW5zKCkge1xuICAgICAgICAgICAgY29uc3QgaGlkZGVuQ29sdW1ucyA9IFsuLi5kYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGguaGlkZGVuLCAudGQuaGlkZGVuXCIpXTtcbiAgICAgICAgICAgIGhpZGRlbkNvbHVtbnMuZm9yRWFjaChoaWRkZW5Db2x1bW4gPT4gaGlkZGVuQ29sdW1uLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIikpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gcmVzZXRDaGV2cm9ucygpIHtcbiAgICAgICAgICAgIGNvbnN0IHJvd3MgPSBbLi4uZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudC5xdWVyeVNlbGVjdG9yQWxsKCcudHJbcm9sZT1cInJvd1wiXScpXTtcbiAgICAgICAgICAgIHJvd3MuZm9yRWFjaChyb3cgPT4ge1xuICAgICAgICAgICAgICAgIHJvdy5xdWVyeVNlbGVjdG9yKFwiLnRoLmNoZXZyb24tdGhcIik/LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIHJvdy5xdWVyeVNlbGVjdG9yKFwiLnRkLmNoZXZyb24tdGRcIik/LnJlbW92ZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBvblNvcnQoKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICByZXNldENvbGxhcHNpYmxlcygpO1xuICAgICAgICAgICAgICAgIHJlc2V0SGlkZGVuQ29sdW1ucygpO1xuICAgICAgICAgICAgICAgIHJlc2V0Q2hldnJvbnMoKTtcbiAgICAgICAgICAgICAgICByZW5kZXJFbGVtZW50cygpO1xuICAgICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGNoZWNrRm9yU29ydGluZygpIHtcbiAgICAgICAgICAgIGNvbnN0IHJvd3MgPSBbLi4uZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnRyW3JvbGU9cm93XVwiKV07XG4gICAgICAgICAgICBjb25zdCBoZWFkZXJzID0gWy4uLnJvd3NbMF0ucXVlcnlTZWxlY3RvckFsbChcIi50aFwiKV07XG4gICAgICAgICAgICBoZWFkZXJzLmZvckVhY2goaGVhZGVyID0+IGhlYWRlci5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgb25Tb3J0KSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2FuUmVuZGVyICYmIHNjcmVlbk1vZGUpIHtcbiAgICAgICAgICAgIC8vIEZvciBkZXNrdG9wIGxlYXZlIC8gcmVzdG9yZSBkZWZhdWx0LiBGb3Igb3RoZXIgc2l0dWF0aW9ucyB1cGRhdGUgdG8gbW9iaWxlIC8gdGFibGV0IGNvbHVtbnNcbiAgICAgICAgICAgIGlmIChzY3JlZW5Nb2RlID09PSBcImRlc2t0b3BcIikge1xuICAgICAgICAgICAgICAgIHRhYmxlQ29udGVudC5zZXRBdHRyaWJ1dGUoXCJzdHlsZVwiLCB0ZW1wbGF0ZUNvbHVtbnMpO1xuICAgICAgICAgICAgICAgIHJlc2V0Q29sbGFwc2libGVzKCk7XG4gICAgICAgICAgICAgICAgcmVzZXRIaWRkZW5Db2x1bW5zKCk7XG4gICAgICAgICAgICAgICAgcmVzZXRDaGV2cm9ucygpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZXRHcmlkQ29sdW1ucygpO1xuXG4gICAgICAgICAgICAgICAgcmVzZXRDb2xsYXBzaWJsZXMoKTtcbiAgICAgICAgICAgICAgICByZXNldEhpZGRlbkNvbHVtbnMoKTtcbiAgICAgICAgICAgICAgICByZXNldENoZXZyb25zKCk7XG5cbiAgICAgICAgICAgICAgICByZW5kZXJFbGVtZW50cygpO1xuICAgICAgICAgICAgICAgIGNoZWNrRm9yU29ydGluZygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNjcmVlbk1vZGUgIT09IFwiZGVza3RvcFwiKSB7XG4gICAgICAgICAgICAvLyBEZXRlY3QgYSBjaGFuZ2UgaW4gRGF0YSBncmlkIDIgYWZ0ZXIgdGhlIGluaXRpYWwgcmVuZGVyaW5nIG9mIGV2ZXJ5dGhpbmdcbiAgICAgICAgICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgICAgICBpZiAoZGF0YWdyaWRSb3dzUmVmLmN1cnJlbnQgIT09IGRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQucXVlcnlTZWxlY3RvckFsbChcIi50cltyb2xlPXJvd11cIikpIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YWdyaWRSb3dzUmVmLmN1cnJlbnQgPSBbLi4uZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnRyW3JvbGU9cm93XVwiKV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChzY3JlZW5Nb2RlICE9PSBcImRlc2t0b3BcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzZXRDb2xsYXBzaWJsZXMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc2V0SGlkZGVuQ29sdW1ucygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzZXRDaGV2cm9ucygpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJFbGVtZW50cygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tGb3JTb3J0aW5nKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQsIGNvbmZpZyk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKGRhdGFncmlkV2lkZ2V0UmVmICYmIGRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQsIGNvbmZpZyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiAoKSA9PiBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgaWYgKGRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICBzZXRUYWJsZUNvbnRlbnQoZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudC5xdWVyeVNlbGVjdG9yKFwiLndpZGdldC1kYXRhZ3JpZCAud2lkZ2V0LWRhdGFncmlkLWdyaWQtYm9keVwiKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQsIGNvbmZpZyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChkYXRhZ3JpZFdpZGdldFJlZiAmJiBkYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQsIGNvbmZpZyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKCkgPT4gb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgIH0pO1xuXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgaWYgKHRhYmxlQ29udGVudCkge1xuICAgICAgICAgICAgc2V0VGVtcGxhdGVDb2x1bW5zKHRhYmxlQ29udGVudC5nZXRBdHRyaWJ1dGUoXCJzdHlsZVwiKSk7XG4gICAgICAgICAgICBpZiAod2luZG93LmlubmVyV2lkdGggPD0gbW9iaWxlQnJlYWtwb2ludCkge1xuICAgICAgICAgICAgICAgIHNldFNjZWVuTW9kZShcIm1vYmlsZVwiKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAod2luZG93LmlubmVyV2lkdGggPiBtb2JpbGVCcmVha3BvaW50ICYmIHdpbmRvdy5pbm5lcldpZHRoIDwgZGVza3RvcEJyZWFrcG9pbnQpIHtcbiAgICAgICAgICAgICAgICBzZXRTY2Vlbk1vZGUoXCJ0YWJsZXRcIik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHdpbmRvdy5pbm5lcldpZHRoID49IGRlc2t0b3BCcmVha3BvaW50KSB7XG4gICAgICAgICAgICAgICAgc2V0U2NlZW5Nb2RlKFwiZGVza3RvcFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNldENhblJlbmRlcih0cnVlKTtcbiAgICAgICAgfVxuICAgIH0sIFtkZXNrdG9wQnJlYWtwb2ludCwgbW9iaWxlQnJlYWtwb2ludCwgdGFibGVDb250ZW50XSk7XG5cbiAgICBpZiAoY2FuUmVuZGVyKSB7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHNjcmVlblNpemVDaGVjayk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e2ByZXNwb25zaXZlLWRhdGFncmlkICR7c3R5bGV9YH0gcmVmPXtkYXRhZ3JpZFdpZGdldFJlZn0+XG4gICAgICAgICAgICB7ZGF0YUdyaWRXaWRnZXR9XG4gICAgICAgIDwvZGl2PlxuICAgICk7XG59XG4iXSwibmFtZXMiOlsiUmVzcG9uc2l2ZURhdGFncmlkVHdvIiwiZGF0YUdyaWRXaWRnZXQiLCJkZXNrdG9wQnJlYWtwb2ludCIsImtlZXBMYXN0Qm9vbGVhbiIsIm1heENvbHVtbnNNb2JpbGUiLCJtYXhDb2x1bW5zVGFibGV0IiwibW9iaWxlQnJlYWtwb2ludCIsInJlc3QiLCJzdHlsZSIsImNsYXNzIiwiZGF0YWdyaWRXaWRnZXRSZWYiLCJ1c2VSZWYiLCJkYXRhZ3JpZFJvd3NSZWYiLCJ0YWJsZUNvbnRlbnQiLCJzZXRUYWJsZUNvbnRlbnQiLCJ1c2VTdGF0ZSIsImNhblJlbmRlciIsInNldENhblJlbmRlciIsInRlbXBsYXRlQ29sdW1ucyIsInNldFRlbXBsYXRlQ29sdW1ucyIsInNjcmVlbk1vZGUiLCJzZXRTY2Vlbk1vZGUiLCJjb25maWciLCJjaGlsZExpc3QiLCJzdWJ0cmVlIiwic2NyZWVuU2l6ZUNoZWNrIiwid2luZG93IiwiaW5uZXJXaWR0aCIsInVzZUVmZmVjdCIsInNldEdyaWRDb2x1bW5zIiwib2Zmc2V0IiwiY29sdW1uQXJyYXkiLCJyZXBsYWNlIiwic3BsaXQiLCJ2aXNpYmxlQ29sdW1ucyIsIm1heENvbHVtbkFycmF5Iiwic2xpY2UiLCJsZW5ndGgiLCJwdXNoIiwiam9pbiIsInVuc2hpZnQiLCJzcGxpY2UiLCJzZXRBdHRyaWJ1dGUiLCJ0b2dnbGVUckNvbGxhcHNlIiwiZXZlbnQiLCJjaGV2cm9uQnRuIiwibm90Q29sbGFwc2VkIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yQWxsIiwiZm9yRWFjaCIsImNoZXZyb25Sb3ciLCJyb3dCdG4iLCJwYXJlbnRFbGVtZW50IiwicXVlcnlTZWxlY3RvciIsImNsYXNzTGlzdCIsInRvZ2dsZSIsInRhcmdldCIsImNsb3Nlc3QiLCJyZW5kZXJDaGV2cm9uIiwicm93Iiwic2VsZWN0VEgiLCJleHRyYVRIIiwiaW5zZXJ0QWRqYWNlbnRIVE1MIiwic2VsZWN0VEQiLCJib3JkZXJDbGFzcyIsImV4dHJhVEQiLCJyZW5kZXJDb2xsYXBzaWJsZURpdiIsImNvbGxhcHNpYmxlRGl2IiwibW92ZUNvbHVtbnNJbnNpZGVDb2xsYXBzaWJsZURpdiIsIlRIcyIsIlRIIiwiYWRkIiwiVERzIiwiVEQiLCJpbmRleCIsImhlYWRlcnMiLCJjdXJyZW50IiwiY29sbGFwc2libGUiLCJjb2xsYXBzaWJsZUNvbnRlbnQiLCJpbm5lckhUTUwiLCJyZW5kZXJFbGVtZW50cyIsImNoZXZyb25CdG5zIiwiYWRkRXZlbnRMaXN0ZW5lciIsInJlc2V0Q29sbGFwc2libGVzIiwiYWxsQ29sbGFwc2libGVzIiwicmVtb3ZlIiwicmVzZXRIaWRkZW5Db2x1bW5zIiwiaGlkZGVuQ29sdW1ucyIsImhpZGRlbkNvbHVtbiIsInJlc2V0Q2hldnJvbnMiLCJyb3dzIiwib25Tb3J0Iiwic2V0VGltZW91dCIsImNoZWNrRm9yU29ydGluZyIsImhlYWRlciIsIm9ic2VydmVyIiwiTXV0YXRpb25PYnNlcnZlciIsImRpc2Nvbm5lY3QiLCJvYnNlcnZlIiwiZ2V0QXR0cmlidXRlIiwiY3JlYXRlRWxlbWVudCIsImNsYXNzTmFtZSIsInJlZiJdLCJtYXBwaW5ncyI6Ijs7SUFHTyxTQUFTQSxxQkFBcUJBLENBQUM7TUFDbENDLGNBQWM7TUFDZEMsaUJBQWlCO01BQ2pCQyxlQUFlO01BQ2ZDLGdCQUFnQjtNQUNoQkMsZ0JBQWdCO01BQ2hCQyxnQkFBZ0I7TUFDaEIsR0FBR0MsSUFBQUE7SUFDUCxDQUFDLEVBQUU7SUFD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
