
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
define(['exports', 'react'], (function (exports, react) { 'use strict';

    function ResponsiveDatagridTwo({
      dataGridWidget,
      desktopBreakpoint,
      maxColumnsMobile,
      maxColumnsTablet,
      mobileBreakpoint,
      ...rest
    }) {
      const style = rest.class || "";
      const datagridWidgetRef = react.useRef(null);
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
      const [shouldSkip, setShouldSkip] = react.useState(false);
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

      // Check the last column for custom content. returns true if it's the case
      function checkLastColumn(row) {
        // Check the TH for custom content
        const mostRightTH = row.querySelector(".th:last-of-type") || row.querySelector(".th:nth-last-child(2)");
        if (mostRightTH) {
          if (mostRightTH.classList.contains("column-selector")) {
            return true;
          } else if (mostRightTH.querySelector("span").innerHTML === "&nbsp;") {
            return true;
          } else {
            return false;
          }
        }

        // Check the TD for custom content
        const MostRightTD = row.querySelector(".td:last-of-type") || row.querySelector(".td:nth-last-child(2)");
        if (MostRightTD) {
          if (MostRightTD.classList.contains("column-selector")) {
            return true;
          } else if (MostRightTD.querySelector(".td-custom-content")) {
            return true;
          } else {
            return false;
          }
        }
        return null;
      }
      react.useEffect(() => {
        function toggleTrCollapse(event, chevronBtn) {
          const notCollapsed = [...document.querySelectorAll(".tr-collapsible:not(.tr-collapsible--collapsed)")];
          if (notCollapsed.length) {
            notCollapsed.forEach(chevronRow => {
              const rowBtn = chevronRow.parentElement.querySelector(".btn-td-collapse");
              if (rowBtn !== chevronBtn) {
                chevronRow.classList.toggle("tr-collapsible--collapsed");
                chevronRow.parentElement.querySelector(".btn-td-collapse").classList.toggle("btn-td-collapse--active");
              }
            });
          }
          chevronBtn.classList.toggle("btn-td-collapse--active");
          event.target.closest(".tr").querySelector(".tr-collapsible").classList.toggle("tr-collapsible--collapsed");
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
            const extraTD = `<div class="td ${borderClass}chevron-td btn-td-collapse" role="gridcell"><div class="td-custom-content"><svg height="16" width="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M8.00004 11.1369C8.21033 11.1369 8.38741 11.0539 8.54789 10.8934L12.4935 6.85368C12.6208 6.72087 12.6872 6.56592 12.6872 6.37777C12.6872 5.9904 12.3829 5.68604 12.0066 5.68604C11.8239 5.68604 11.6469 5.76351 11.5085 5.90186L8.00557 9.50439L4.49158 5.90186C4.35876 5.76904 4.18722 5.68604 3.99353 5.68604C3.61723 5.68604 3.31287 5.9904 3.31287 6.37777C3.31287 6.56038 3.38481 6.72087 3.51208 6.85368L7.45772 10.8934C7.62374 11.0594 7.79529 11.1369 8.00004 11.1369Z"/></svg></div></div>`;
            if (selectTD && selectTD.querySelector(".td-custom-content")) {
              selectTD.insertAdjacentHTML("afterend", extraTD);
            } else if (selectTD) {
              selectTD.insertAdjacentHTML("beforebegin", extraTD);
            }
          }
        }
        function renderCollapsibleDiv(row) {
          const collapsibleDiv = `<div class="tr-collapsible tr-collapsible--collapsed"></div>`;
          if (!row.querySelector(".tr-collapsible")) {
            row.insertAdjacentHTML("beforeend", collapsibleDiv);
          }
        }
        function moveColumnsInsideCollapsibleDiv(row) {
          const endsWithCustomContent = checkLastColumn(row);
          const offset = endsWithCustomContent ? -1 : 0;
          const visibleColumns = screenMode === "mobile" ? maxColumnsMobile : maxColumnsTablet;
          const THs = [...row.querySelectorAll(".th")];
          if (THs.length) {
            THs.slice(THs.length - (THs.length - visibleColumns) - offset).forEach(TH => {
              TH.classList.add("hidden");
            });
          }
          const TDs = [...row.querySelectorAll(".td")];
          if (TDs.length) {
            const newTDs = TDs.slice(TDs.length - (TDs.length - visibleColumns) - offset);
            newTDs.forEach((TD, index) => {
              TD.classList.add("hidden");
              const headers = [...datagridWidgetRef.current.querySelectorAll('.widget-datagrid .tr[role="row"]:first-child .th.hidden')];
              const collapsible = row.querySelector(".tr-collapsible");
              const collapsibleContent = `<div class="tr-collapsible__item">
                        <p class="td-text text-bold nomargin">${headers[index]?.querySelector("span").innerHTML}</p>
                            <span class="td-text">${TD.querySelector("span")?.innerHTML}</span>
                        </div>`;
              collapsible.insertAdjacentHTML("beforeend", collapsibleContent);
            });
          }
        }
        function renderElements() {
          // Process each row
          const rows = [...datagridWidgetRef.current.querySelectorAll(".tr[role=row]")];
          rows.forEach(row => {
            renderCollapsibleDiv(row);
            moveColumnsInsideCollapsibleDiv(row);
            renderChevron(row);
          });
          const chevronBtns = [...datagridWidgetRef.current.querySelectorAll(".btn-td-collapse")];
          chevronBtns.forEach(chevronBtn => chevronBtn.addEventListener("click", event => toggleTrCollapse(event, chevronBtn)));
        }
        function resetCollapsibles() {
          const allCollapsibles = [...datagridWidgetRef.current.querySelectorAll(".tr-collapsible")];
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
            const endsWithCustomContent = checkLastColumn(datagridWidgetRef.current.querySelector(".widget-datagrid .tr[role='row']:nth-child(2)"));
            const offset = endsWithCustomContent ? -1 : 0;
            const columnArray = templateColumns.replace("grid-template-columns: ", "").split(" ");
            const visibleColumns = screenMode === "mobile" ? maxColumnsMobile : maxColumnsTablet;
            const maxColumnArray = columnArray.slice(columnArray.length - visibleColumns - offset); // remove all but the last maxColumnsMobile

            if (offset) {
              maxColumnArray.push("fit-content(100%)");
            }
            maxColumnArray.join(" ").replace(";", "");
            maxColumnArray.unshift("fit-content(100%)"); // add new column for the chevron
            tableContent.setAttribute("style", `grid-template-columns: ${maxColumnArray.join(" ").replace(";", "")};`);
            resetCollapsibles();
            resetHiddenColumns();
            resetChevrons();
            renderElements();
            checkForSorting();
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
        if (shouldSkip === false) {
          setShouldSkip(true);
        }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzcG9uc2l2ZURhdGFncmlkVHdvLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvUmVzcG9uc2l2ZURhdGFncmlkVHdvLmpzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgXCIuL3VpL1Jlc3BvbnNpdmVEYXRhZ3JpZFR3by5jc3NcIjtcbmltcG9ydCB7IGNyZWF0ZUVsZW1lbnQsIHVzZUVmZmVjdCwgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuXG5leHBvcnQgZnVuY3Rpb24gUmVzcG9uc2l2ZURhdGFncmlkVHdvKHtcbiAgICBkYXRhR3JpZFdpZGdldCxcbiAgICBkZXNrdG9wQnJlYWtwb2ludCxcbiAgICBtYXhDb2x1bW5zTW9iaWxlLFxuICAgIG1heENvbHVtbnNUYWJsZXQsXG4gICAgbW9iaWxlQnJlYWtwb2ludCxcbiAgICAuLi5yZXN0XG59KSB7XG4gICAgY29uc3Qgc3R5bGUgPSByZXN0LmNsYXNzIHx8IFwiXCI7XG4gICAgY29uc3QgZGF0YWdyaWRXaWRnZXRSZWYgPSB1c2VSZWYobnVsbCk7XG4gICAgY29uc3QgW3RhYmxlQ29udGVudCwgc2V0VGFibGVDb250ZW50XSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtjYW5SZW5kZXIsIHNldENhblJlbmRlcl0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3QgW3RlbXBsYXRlQ29sdW1ucywgc2V0VGVtcGxhdGVDb2x1bW5zXSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtzY3JlZW5Nb2RlLCBzZXRTY2Vlbk1vZGVdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgY29uZmlnID0ge1xuICAgICAgICAvLyBhdHRyaWJ1dGVzOiB0cnVlLFxuICAgICAgICAvLyBhdHRyaWJ1dGVPbGRWYWx1ZTogdHJ1ZSxcbiAgICAgICAgY2hpbGRMaXN0OiB0cnVlLCAvLyBUaGlzIGlzIGEgbXVzdCBoYXZlIGZvciB0aGUgb2JzZXJ2ZXIgd2l0aCBzdWJ0cmVlXG4gICAgICAgIHN1YnRyZWU6IHRydWUgLy8gU2V0IHRvIHRydWUgaWYgY2hhbmdlcyBtdXN0IGFsc28gYmUgb2JzZXJ2ZWQgaW4gZGVzY2VuZGFudHMuXG4gICAgfTtcbiAgICBjb25zdCBbc2hvdWxkU2tpcCwgc2V0U2hvdWxkU2tpcF0gPSB1c2VTdGF0ZShmYWxzZSk7XG5cbiAgICBmdW5jdGlvbiBzY3JlZW5TaXplQ2hlY2soKSB7XG4gICAgICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA8PSBtb2JpbGVCcmVha3BvaW50KSB7XG4gICAgICAgICAgICBpZiAoc2NyZWVuTW9kZSAhPT0gXCJtb2JpbGVcIikge1xuICAgICAgICAgICAgICAgIHNldFNjZWVuTW9kZShcIm1vYmlsZVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA+IG1vYmlsZUJyZWFrcG9pbnQgJiYgd2luZG93LmlubmVyV2lkdGggPCBkZXNrdG9wQnJlYWtwb2ludCkge1xuICAgICAgICAgICAgaWYgKHNjcmVlbk1vZGUgIT09IFwidGFibGV0XCIpIHtcbiAgICAgICAgICAgICAgICBzZXRTY2Vlbk1vZGUoXCJ0YWJsZXRcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAod2luZG93LmlubmVyV2lkdGggPj0gZGVza3RvcEJyZWFrcG9pbnQpIHtcbiAgICAgICAgICAgIGlmIChzY3JlZW5Nb2RlICE9PSBcImRlc2t0b3BcIikge1xuICAgICAgICAgICAgICAgIHNldFNjZWVuTW9kZShcImRlc2t0b3BcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBDaGVjayB0aGUgbGFzdCBjb2x1bW4gZm9yIGN1c3RvbSBjb250ZW50LiByZXR1cm5zIHRydWUgaWYgaXQncyB0aGUgY2FzZVxuICAgIGZ1bmN0aW9uIGNoZWNrTGFzdENvbHVtbihyb3cpIHtcbiAgICAgICAgLy8gQ2hlY2sgdGhlIFRIIGZvciBjdXN0b20gY29udGVudFxuICAgICAgICBjb25zdCBtb3N0UmlnaHRUSCA9IHJvdy5xdWVyeVNlbGVjdG9yKFwiLnRoOmxhc3Qtb2YtdHlwZVwiKSB8fCByb3cucXVlcnlTZWxlY3RvcihcIi50aDpudGgtbGFzdC1jaGlsZCgyKVwiKTtcbiAgICAgICAgaWYgKG1vc3RSaWdodFRIKSB7XG4gICAgICAgICAgICBpZiAobW9zdFJpZ2h0VEguY2xhc3NMaXN0LmNvbnRhaW5zKFwiY29sdW1uLXNlbGVjdG9yXCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG1vc3RSaWdodFRILnF1ZXJ5U2VsZWN0b3IoXCJzcGFuXCIpLmlubmVySFRNTCA9PT0gXCImbmJzcDtcIikge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDaGVjayB0aGUgVEQgZm9yIGN1c3RvbSBjb250ZW50XG4gICAgICAgIGNvbnN0IE1vc3RSaWdodFREID0gcm93LnF1ZXJ5U2VsZWN0b3IoXCIudGQ6bGFzdC1vZi10eXBlXCIpIHx8IHJvdy5xdWVyeVNlbGVjdG9yKFwiLnRkOm50aC1sYXN0LWNoaWxkKDIpXCIpO1xuICAgICAgICBpZiAoTW9zdFJpZ2h0VEQpIHtcbiAgICAgICAgICAgIGlmIChNb3N0UmlnaHRURC5jbGFzc0xpc3QuY29udGFpbnMoXCJjb2x1bW4tc2VsZWN0b3JcIikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoTW9zdFJpZ2h0VEQucXVlcnlTZWxlY3RvcihcIi50ZC1jdXN0b20tY29udGVudFwiKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBmdW5jdGlvbiB0b2dnbGVUckNvbGxhcHNlKGV2ZW50LCBjaGV2cm9uQnRuKSB7XG4gICAgICAgICAgICBjb25zdCBub3RDb2xsYXBzZWQgPSBbLi4uZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi50ci1jb2xsYXBzaWJsZTpub3QoLnRyLWNvbGxhcHNpYmxlLS1jb2xsYXBzZWQpXCIpXTtcbiAgICAgICAgICAgIGlmIChub3RDb2xsYXBzZWQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgbm90Q29sbGFwc2VkLmZvckVhY2goY2hldnJvblJvdyA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJvd0J0biA9IGNoZXZyb25Sb3cucGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmJ0bi10ZC1jb2xsYXBzZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJvd0J0biAhPT0gY2hldnJvbkJ0bikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hldnJvblJvdy5jbGFzc0xpc3QudG9nZ2xlKFwidHItY29sbGFwc2libGUtLWNvbGxhcHNlZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoZXZyb25Sb3cucGFyZW50RWxlbWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5xdWVyeVNlbGVjdG9yKFwiLmJ0bi10ZC1jb2xsYXBzZVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jbGFzc0xpc3QudG9nZ2xlKFwiYnRuLXRkLWNvbGxhcHNlLS1hY3RpdmVcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2hldnJvbkJ0bi5jbGFzc0xpc3QudG9nZ2xlKFwiYnRuLXRkLWNvbGxhcHNlLS1hY3RpdmVcIik7XG4gICAgICAgICAgICBldmVudC50YXJnZXQuY2xvc2VzdChcIi50clwiKS5xdWVyeVNlbGVjdG9yKFwiLnRyLWNvbGxhcHNpYmxlXCIpLmNsYXNzTGlzdC50b2dnbGUoXCJ0ci1jb2xsYXBzaWJsZS0tY29sbGFwc2VkXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2hlY2sgdGhlIGNvbHVtbiB0byBpbnNlcnQgdGhlIGNoZXZyb25cbiAgICAgICAgZnVuY3Rpb24gcmVuZGVyQ2hldnJvbihyb3cpIHtcbiAgICAgICAgICAgIC8vIENoZWNrIGZpcnN0IFRIIGlmIHRoZXJlIGlzIG5vIGNoZXZyb24gcHJlc2VudFxuICAgICAgICAgICAgaWYgKCFyb3cucXVlcnlTZWxlY3RvcihcIi50aC5jaGV2cm9uLXRoXCIpKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0VEggPSByb3cucXVlcnlTZWxlY3RvcihcIi50aFwiKTtcbiAgICAgICAgICAgICAgICBjb25zdCBleHRyYVRIID0gYDxkaXYgY2xhc3M9XCJ0aCBjaGV2cm9uLXRoXCIgcm9sZT1cImNvbHVtbmhlYWRlclwiPjxkaXYgY2xhc3M9XCJjb2x1bW4tY29udGFpbmVyXCI+Jm5ic3A7PC9kaXY+PC9kaXY+YDtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZWN0VEggJiYgc2VsZWN0VEgucXVlcnlTZWxlY3RvcihcIi50ZC1jdXN0b20tY29udGVudFwiKSkge1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3RUSC5pbnNlcnRBZGphY2VudEhUTUwoXCJhZnRlcmVuZFwiLCBleHRyYVRIKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNlbGVjdFRIKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdFRILmluc2VydEFkamFjZW50SFRNTChcImJlZm9yZWJlZ2luXCIsIGV4dHJhVEgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQ2hlY2sgZmlyc3QgVEQgaWYgdGhlcmUgaXMgbm8gY2hldnJvbiBwcmVzZW50XG4gICAgICAgICAgICBpZiAoIXJvdy5xdWVyeVNlbGVjdG9yKFwiLnRkLmNoZXZyb24tdGRcIikpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzZWxlY3RURCA9IHJvdy5xdWVyeVNlbGVjdG9yKFwiLnRkXCIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGJvcmRlckNsYXNzID0gcm93LnF1ZXJ5U2VsZWN0b3IoXCIudGQtYm9yZGVyc1wiKSA/IFwidGQtYm9yZGVycyBcIiA6IFwiXCI7XG4gICAgICAgICAgICAgICAgY29uc3QgZXh0cmFURCA9IGA8ZGl2IGNsYXNzPVwidGQgJHtib3JkZXJDbGFzc31jaGV2cm9uLXRkIGJ0bi10ZC1jb2xsYXBzZVwiIHJvbGU9XCJncmlkY2VsbFwiPjxkaXYgY2xhc3M9XCJ0ZC1jdXN0b20tY29udGVudFwiPjxzdmcgaGVpZ2h0PVwiMTZcIiB3aWR0aD1cIjE2XCIgdmlld0JveD1cIjAgMCAxNiAxNlwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIj48cGF0aCBkPVwiTTguMDAwMDQgMTEuMTM2OUM4LjIxMDMzIDExLjEzNjkgOC4zODc0MSAxMS4wNTM5IDguNTQ3ODkgMTAuODkzNEwxMi40OTM1IDYuODUzNjhDMTIuNjIwOCA2LjcyMDg3IDEyLjY4NzIgNi41NjU5MiAxMi42ODcyIDYuMzc3NzdDMTIuNjg3MiA1Ljk5MDQgMTIuMzgyOSA1LjY4NjA0IDEyLjAwNjYgNS42ODYwNEMxMS44MjM5IDUuNjg2MDQgMTEuNjQ2OSA1Ljc2MzUxIDExLjUwODUgNS45MDE4Nkw4LjAwNTU3IDkuNTA0MzlMNC40OTE1OCA1LjkwMTg2QzQuMzU4NzYgNS43NjkwNCA0LjE4NzIyIDUuNjg2MDQgMy45OTM1MyA1LjY4NjA0QzMuNjE3MjMgNS42ODYwNCAzLjMxMjg3IDUuOTkwNCAzLjMxMjg3IDYuMzc3NzdDMy4zMTI4NyA2LjU2MDM4IDMuMzg0ODEgNi43MjA4NyAzLjUxMjA4IDYuODUzNjhMNy40NTc3MiAxMC44OTM0QzcuNjIzNzQgMTEuMDU5NCA3Ljc5NTI5IDExLjEzNjkgOC4wMDAwNCAxMS4xMzY5WlwiLz48L3N2Zz48L2Rpdj48L2Rpdj5gO1xuICAgICAgICAgICAgICAgIGlmIChzZWxlY3RURCAmJiBzZWxlY3RURC5xdWVyeVNlbGVjdG9yKFwiLnRkLWN1c3RvbS1jb250ZW50XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdFRELmluc2VydEFkamFjZW50SFRNTChcImFmdGVyZW5kXCIsIGV4dHJhVEQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc2VsZWN0VEQpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0VEQuaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYmVmb3JlYmVnaW5cIiwgZXh0cmFURCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gcmVuZGVyQ29sbGFwc2libGVEaXYocm93KSB7XG4gICAgICAgICAgICBjb25zdCBjb2xsYXBzaWJsZURpdiA9IGA8ZGl2IGNsYXNzPVwidHItY29sbGFwc2libGUgdHItY29sbGFwc2libGUtLWNvbGxhcHNlZFwiPjwvZGl2PmA7XG4gICAgICAgICAgICBpZiAoIXJvdy5xdWVyeVNlbGVjdG9yKFwiLnRyLWNvbGxhcHNpYmxlXCIpKSB7XG4gICAgICAgICAgICAgICAgcm93Lmluc2VydEFkamFjZW50SFRNTChcImJlZm9yZWVuZFwiLCBjb2xsYXBzaWJsZURpdik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBtb3ZlQ29sdW1uc0luc2lkZUNvbGxhcHNpYmxlRGl2KHJvdykge1xuICAgICAgICAgICAgY29uc3QgZW5kc1dpdGhDdXN0b21Db250ZW50ID0gY2hlY2tMYXN0Q29sdW1uKHJvdyk7XG4gICAgICAgICAgICBjb25zdCBvZmZzZXQgPSBlbmRzV2l0aEN1c3RvbUNvbnRlbnQgPyAtMSA6IDA7XG4gICAgICAgICAgICBjb25zdCB2aXNpYmxlQ29sdW1ucyA9IHNjcmVlbk1vZGUgPT09IFwibW9iaWxlXCIgPyBtYXhDb2x1bW5zTW9iaWxlIDogbWF4Q29sdW1uc1RhYmxldDtcbiAgICAgICAgICAgIGNvbnN0IFRIcyA9IFsuLi5yb3cucXVlcnlTZWxlY3RvckFsbChcIi50aFwiKV07XG4gICAgICAgICAgICBpZiAoVEhzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIFRIcy5zbGljZShUSHMubGVuZ3RoIC0gKFRIcy5sZW5ndGggLSB2aXNpYmxlQ29sdW1ucykgLSBvZmZzZXQpLmZvckVhY2goVEggPT4ge1xuICAgICAgICAgICAgICAgICAgICBUSC5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBURHMgPSBbLi4ucm93LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGRcIildO1xuICAgICAgICAgICAgaWYgKFREcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdURHMgPSBURHMuc2xpY2UoVERzLmxlbmd0aCAtIChURHMubGVuZ3RoIC0gdmlzaWJsZUNvbHVtbnMpIC0gb2Zmc2V0KTtcbiAgICAgICAgICAgICAgICBuZXdURHMuZm9yRWFjaCgoVEQsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIFRELmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhlYWRlcnMgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5kYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJy53aWRnZXQtZGF0YWdyaWQgLnRyW3JvbGU9XCJyb3dcIl06Zmlyc3QtY2hpbGQgLnRoLmhpZGRlbidcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sbGFwc2libGUgPSByb3cucXVlcnlTZWxlY3RvcihcIi50ci1jb2xsYXBzaWJsZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sbGFwc2libGVDb250ZW50ID0gYDxkaXYgY2xhc3M9XCJ0ci1jb2xsYXBzaWJsZV9faXRlbVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJ0ZC10ZXh0IHRleHQtYm9sZCBub21hcmdpblwiPiR7aGVhZGVyc1tpbmRleF0/LnF1ZXJ5U2VsZWN0b3IoXCJzcGFuXCIpLmlubmVySFRNTH08L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0ZC10ZXh0XCI+JHtURC5xdWVyeVNlbGVjdG9yKFwic3BhblwiKT8uaW5uZXJIVE1MfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PmA7XG4gICAgICAgICAgICAgICAgICAgIGNvbGxhcHNpYmxlLmluc2VydEFkamFjZW50SFRNTChcImJlZm9yZWVuZFwiLCBjb2xsYXBzaWJsZUNvbnRlbnQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gcmVuZGVyRWxlbWVudHMoKSB7XG4gICAgICAgICAgICAvLyBQcm9jZXNzIGVhY2ggcm93XG4gICAgICAgICAgICBjb25zdCByb3dzID0gWy4uLmRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQucXVlcnlTZWxlY3RvckFsbChcIi50cltyb2xlPXJvd11cIildO1xuICAgICAgICAgICAgcm93cy5mb3JFYWNoKHJvdyA9PiB7XG4gICAgICAgICAgICAgICAgcmVuZGVyQ29sbGFwc2libGVEaXYocm93KTtcbiAgICAgICAgICAgICAgICBtb3ZlQ29sdW1uc0luc2lkZUNvbGxhcHNpYmxlRGl2KHJvdyk7XG4gICAgICAgICAgICAgICAgcmVuZGVyQ2hldnJvbihyb3cpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGNvbnN0IGNoZXZyb25CdG5zID0gWy4uLmRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQucXVlcnlTZWxlY3RvckFsbChcIi5idG4tdGQtY29sbGFwc2VcIildO1xuICAgICAgICAgICAgY2hldnJvbkJ0bnMuZm9yRWFjaChjaGV2cm9uQnRuID0+XG4gICAgICAgICAgICAgICAgY2hldnJvbkJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZXZlbnQgPT4gdG9nZ2xlVHJDb2xsYXBzZShldmVudCwgY2hldnJvbkJ0bikpXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gcmVzZXRDb2xsYXBzaWJsZXMoKSB7XG4gICAgICAgICAgICBjb25zdCBhbGxDb2xsYXBzaWJsZXMgPSBbLi4uZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnRyLWNvbGxhcHNpYmxlXCIpXTtcbiAgICAgICAgICAgIGFsbENvbGxhcHNpYmxlcy5mb3JFYWNoKGNvbGxhcHNpYmxlID0+IGNvbGxhcHNpYmxlLnJlbW92ZSgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHJlc2V0SGlkZGVuQ29sdW1ucygpIHtcbiAgICAgICAgICAgIGNvbnN0IGhpZGRlbkNvbHVtbnMgPSBbLi4uZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnRoLmhpZGRlbiwgLnRkLmhpZGRlblwiKV07XG4gICAgICAgICAgICBoaWRkZW5Db2x1bW5zLmZvckVhY2goaGlkZGVuQ29sdW1uID0+IGhpZGRlbkNvbHVtbi5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHJlc2V0Q2hldnJvbnMoKSB7XG4gICAgICAgICAgICBjb25zdCByb3dzID0gWy4uLmRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQucXVlcnlTZWxlY3RvckFsbCgnLnRyW3JvbGU9XCJyb3dcIl0nKV07XG4gICAgICAgICAgICByb3dzLmZvckVhY2gocm93ID0+IHtcbiAgICAgICAgICAgICAgICByb3cucXVlcnlTZWxlY3RvcihcIi50aC5jaGV2cm9uLXRoXCIpPy5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICByb3cucXVlcnlTZWxlY3RvcihcIi50ZC5jaGV2cm9uLXRkXCIpPy5yZW1vdmUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gb25Tb3J0KCkge1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzZXRDb2xsYXBzaWJsZXMoKTtcbiAgICAgICAgICAgICAgICByZXNldEhpZGRlbkNvbHVtbnMoKTtcbiAgICAgICAgICAgICAgICByZXNldENoZXZyb25zKCk7XG4gICAgICAgICAgICAgICAgcmVuZGVyRWxlbWVudHMoKTtcbiAgICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBjaGVja0ZvclNvcnRpbmcoKSB7XG4gICAgICAgICAgICBjb25zdCByb3dzID0gWy4uLmRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQucXVlcnlTZWxlY3RvckFsbChcIi50cltyb2xlPXJvd11cIildO1xuICAgICAgICAgICAgY29uc3QgaGVhZGVycyA9IFsuLi5yb3dzWzBdLnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGhcIildO1xuICAgICAgICAgICAgaGVhZGVycy5mb3JFYWNoKGhlYWRlciA9PiBoZWFkZXIuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIG9uU29ydCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNhblJlbmRlciAmJiBzY3JlZW5Nb2RlKSB7XG4gICAgICAgICAgICAvLyBGb3IgZGVza3RvcCBsZWF2ZSAvIHJlc3RvcmUgZGVmYXVsdC4gRm9yIG90aGVyIHNpdHVhdGlvbnMgdXBkYXRlIHRvIG1vYmlsZSAvIHRhYmxldCBjb2x1bW5zXG4gICAgICAgICAgICBpZiAoc2NyZWVuTW9kZSA9PT0gXCJkZXNrdG9wXCIpIHtcbiAgICAgICAgICAgICAgICB0YWJsZUNvbnRlbnQuc2V0QXR0cmlidXRlKFwic3R5bGVcIiwgdGVtcGxhdGVDb2x1bW5zKTtcbiAgICAgICAgICAgICAgICByZXNldENvbGxhcHNpYmxlcygpO1xuICAgICAgICAgICAgICAgIHJlc2V0SGlkZGVuQ29sdW1ucygpO1xuICAgICAgICAgICAgICAgIHJlc2V0Q2hldnJvbnMoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZW5kc1dpdGhDdXN0b21Db250ZW50ID0gY2hlY2tMYXN0Q29sdW1uKFxuICAgICAgICAgICAgICAgICAgICBkYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2lkZ2V0LWRhdGFncmlkIC50cltyb2xlPSdyb3cnXTpudGgtY2hpbGQoMilcIilcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGNvbnN0IG9mZnNldCA9IGVuZHNXaXRoQ3VzdG9tQ29udGVudCA/IC0xIDogMDtcbiAgICAgICAgICAgICAgICBjb25zdCBjb2x1bW5BcnJheSA9IHRlbXBsYXRlQ29sdW1ucy5yZXBsYWNlKFwiZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiBcIiwgXCJcIikuc3BsaXQoXCIgXCIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZpc2libGVDb2x1bW5zID0gc2NyZWVuTW9kZSA9PT0gXCJtb2JpbGVcIiA/IG1heENvbHVtbnNNb2JpbGUgOiBtYXhDb2x1bW5zVGFibGV0O1xuICAgICAgICAgICAgICAgIGNvbnN0IG1heENvbHVtbkFycmF5ID0gY29sdW1uQXJyYXkuc2xpY2UoY29sdW1uQXJyYXkubGVuZ3RoIC0gdmlzaWJsZUNvbHVtbnMgLSBvZmZzZXQpOyAvLyByZW1vdmUgYWxsIGJ1dCB0aGUgbGFzdCBtYXhDb2x1bW5zTW9iaWxlXG5cbiAgICAgICAgICAgICAgICBpZiAob2Zmc2V0KSB7XG4gICAgICAgICAgICAgICAgICAgIG1heENvbHVtbkFycmF5LnB1c2goXCJmaXQtY29udGVudCgxMDAlKVwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbWF4Q29sdW1uQXJyYXkuam9pbihcIiBcIikucmVwbGFjZShcIjtcIiwgXCJcIik7XG4gICAgICAgICAgICAgICAgbWF4Q29sdW1uQXJyYXkudW5zaGlmdChcImZpdC1jb250ZW50KDEwMCUpXCIpOyAvLyBhZGQgbmV3IGNvbHVtbiBmb3IgdGhlIGNoZXZyb25cbiAgICAgICAgICAgICAgICB0YWJsZUNvbnRlbnQuc2V0QXR0cmlidXRlKFxuICAgICAgICAgICAgICAgICAgICBcInN0eWxlXCIsXG4gICAgICAgICAgICAgICAgICAgIGBncmlkLXRlbXBsYXRlLWNvbHVtbnM6ICR7bWF4Q29sdW1uQXJyYXkuam9pbihcIiBcIikucmVwbGFjZShcIjtcIiwgXCJcIil9O2BcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgcmVzZXRDb2xsYXBzaWJsZXMoKTtcbiAgICAgICAgICAgICAgICByZXNldEhpZGRlbkNvbHVtbnMoKTtcbiAgICAgICAgICAgICAgICByZXNldENoZXZyb25zKCk7XG5cbiAgICAgICAgICAgICAgICByZW5kZXJFbGVtZW50cygpO1xuICAgICAgICAgICAgICAgIGNoZWNrRm9yU29ydGluZygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKCgpID0+IHtcbiAgICAgICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgIGlmIChkYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgc2V0VGFibGVDb250ZW50KGRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQucXVlcnlTZWxlY3RvcihcIi53aWRnZXQtZGF0YWdyaWQgLndpZGdldC1kYXRhZ3JpZC1ncmlkLWJvZHlcIikpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShkYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50LCBjb25maWcpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoZGF0YWdyaWRXaWRnZXRSZWYgJiYgZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudCkge1xuICAgICAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShkYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50LCBjb25maWcpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICgpID0+IG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICB9KTtcblxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGlmICh0YWJsZUNvbnRlbnQpIHtcbiAgICAgICAgICAgIHNldFRlbXBsYXRlQ29sdW1ucyh0YWJsZUNvbnRlbnQuZ2V0QXR0cmlidXRlKFwic3R5bGVcIikpO1xuICAgICAgICAgICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoIDw9IG1vYmlsZUJyZWFrcG9pbnQpIHtcbiAgICAgICAgICAgICAgICBzZXRTY2Vlbk1vZGUoXCJtb2JpbGVcIik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHdpbmRvdy5pbm5lcldpZHRoID4gbW9iaWxlQnJlYWtwb2ludCAmJiB3aW5kb3cuaW5uZXJXaWR0aCA8IGRlc2t0b3BCcmVha3BvaW50KSB7XG4gICAgICAgICAgICAgICAgc2V0U2NlZW5Nb2RlKFwidGFibGV0XCIpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA+PSBkZXNrdG9wQnJlYWtwb2ludCkge1xuICAgICAgICAgICAgICAgIHNldFNjZWVuTW9kZShcImRlc2t0b3BcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZXRDYW5SZW5kZXIodHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9LCBbZGVza3RvcEJyZWFrcG9pbnQsIG1vYmlsZUJyZWFrcG9pbnQsIHRhYmxlQ29udGVudF0pO1xuXG4gICAgaWYgKGNhblJlbmRlcikge1xuICAgICAgICBpZiAoc2hvdWxkU2tpcCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHNldFNob3VsZFNraXAodHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgc2NyZWVuU2l6ZUNoZWNrKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YHJlc3BvbnNpdmUtZGF0YWdyaWQgJHtzdHlsZX1gfSByZWY9e2RhdGFncmlkV2lkZ2V0UmVmfT5cbiAgICAgICAgICAgIHtkYXRhR3JpZFdpZGdldH1cbiAgICAgICAgPC9kaXY+XG4gICAgKTtcbn1cbiJdLCJuYW1lcyI6WyJSZXNwb25zaXZlRGF0YWdyaWRUd28iLCJkYXRhR3JpZFdpZGdldCIsImRlc2t0b3BCcmVha3BvaW50IiwibWF4Q29sdW1uc01vYmlsZSIsIm1heENvbHVtbnNUYWJsZXQiLCJtb2JpbGVCcmVha3BvaW50IiwicmVzdCIsInN0eWxlIiwiY2xhc3MiLCJkYXRhZ3JpZFdpZGdldFJlZiIsInVzZVJlZiIsInRhYmxlQ29udGVudCIsInNldFRhYmxlQ29udGVudCIsInVzZVN0YXRlIiwiY2FuUmVuZGVyIiwic2V0Q2FuUmVuZGVyIiwidGVtcGxhdGVDb2x1bW5zIiwic2V0VGVtcGxhdGVDb2x1bW5zIiwic2NyZWVuTW9kZSIsInNldFNjZWVuTW9kZSIsImNvbmZpZyIsImNoaWxkTGlzdCIsInN1YnRyZWUiLCJzaG91bGRTa2lwIiwic2V0U2hvdWxkU2tpcCIsInNjcmVlblNpemVDaGVjayIsIndpbmRvdyIsImlubmVyV2lkdGgiLCJjaGVja0xhc3RDb2x1bW4iLCJyb3ciLCJtb3N0UmlnaHRUSCIsInF1ZXJ5U2VsZWN0b3IiLCJjbGFzc0xpc3QiLCJjb250YWlucyIsImlubmVySFRNTCIsIk1vc3RSaWdodFREIiwidXNlRWZmZWN0IiwidG9nZ2xlVHJDb2xsYXBzZSIsImV2ZW50IiwiY2hldnJvbkJ0biIsIm5vdENvbGxhcHNlZCIsImRvY3VtZW50IiwicXVlcnlTZWxlY3RvckFsbCIsImxlbmd0aCIsImZvckVhY2giLCJjaGV2cm9uUm93Iiwicm93QnRuIiwicGFyZW50RWxlbWVudCIsInRvZ2dsZSIsInRhcmdldCIsImNsb3Nlc3QiLCJyZW5kZXJDaGV2cm9uIiwic2VsZWN0VEgiLCJleHRyYVRIIiwiaW5zZXJ0QWRqYWNlbnRIVE1MIiwic2VsZWN0VEQiLCJib3JkZXJDbGFzcyIsImV4dHJhVEQiLCJyZW5kZXJDb2xsYXBzaWJsZURpdiIsImNvbGxhcHNpYmxlRGl2IiwibW92ZUNvbHVtbnNJbnNpZGVDb2xsYXBzaWJsZURpdiIsImVuZHNXaXRoQ3VzdG9tQ29udGVudCIsIm9mZnNldCIsInZpc2libGVDb2x1bW5zIiwiVEhzIiwic2xpY2UiLCJUSCIsImFkZCIsIlREcyIsIm5ld1REcyIsIlREIiwiaW5kZXgiLCJoZWFkZXJzIiwiY3VycmVudCIsImNvbGxhcHNpYmxlIiwiY29sbGFwc2libGVDb250ZW50IiwicmVuZGVyRWxlbWVudHMiLCJyb3dzIiwiY2hldnJvbkJ0bnMiLCJhZGRFdmVudExpc3RlbmVyIiwicmVzZXRDb2xsYXBzaWJsZXMiLCJhbGxDb2xsYXBzaWJsZXMiLCJyZW1vdmUiLCJyZXNldEhpZGRlbkNvbHVtbnMiLCJoaWRkZW5Db2x1bW5zIiwiaGlkZGVuQ29sdW1uIiwicmVzZXRDaGV2cm9ucyIsIm9uU29ydCIsInNldFRpbWVvdXQiLCJjaGVja0ZvclNvcnRpbmciLCJoZWFkZXIiLCJzZXRBdHRyaWJ1dGUiLCJjb2x1bW5BcnJheSIsInJlcGxhY2UiLCJzcGxpdCIsIm1heENvbHVtbkFycmF5IiwicHVzaCIsImpvaW4iLCJ1bnNoaWZ0Iiwib2JzZXJ2ZXIiLCJNdXRhdGlvbk9ic2VydmVyIiwiZGlzY29ubmVjdCIsIm9ic2Vy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
