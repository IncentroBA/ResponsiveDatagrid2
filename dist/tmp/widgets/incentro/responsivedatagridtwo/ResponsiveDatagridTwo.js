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
            maxColumnArray.splice(2, 1, "1fr"); // convert at least one auto-fill column to auto-fill
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzcG9uc2l2ZURhdGFncmlkVHdvLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvUmVzcG9uc2l2ZURhdGFncmlkVHdvLmpzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgXCIuL3VpL1Jlc3BvbnNpdmVEYXRhZ3JpZFR3by5jc3NcIjtcbmltcG9ydCB7IGNyZWF0ZUVsZW1lbnQsIHVzZUVmZmVjdCwgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuXG5leHBvcnQgZnVuY3Rpb24gUmVzcG9uc2l2ZURhdGFncmlkVHdvKHtcbiAgICBkYXRhR3JpZFdpZGdldCxcbiAgICBkZXNrdG9wQnJlYWtwb2ludCxcbiAgICBtYXhDb2x1bW5zTW9iaWxlLFxuICAgIG1heENvbHVtbnNUYWJsZXQsXG4gICAgbW9iaWxlQnJlYWtwb2ludCxcbiAgICAuLi5yZXN0XG59KSB7XG4gICAgY29uc3Qgc3R5bGUgPSByZXN0LmNsYXNzIHx8IFwiXCI7XG4gICAgY29uc3QgZGF0YWdyaWRXaWRnZXRSZWYgPSB1c2VSZWYobnVsbCk7XG4gICAgY29uc3QgW3RhYmxlQ29udGVudCwgc2V0VGFibGVDb250ZW50XSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtjYW5SZW5kZXIsIHNldENhblJlbmRlcl0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3QgW3RlbXBsYXRlQ29sdW1ucywgc2V0VGVtcGxhdGVDb2x1bW5zXSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtzY3JlZW5Nb2RlLCBzZXRTY2Vlbk1vZGVdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgY29uZmlnID0ge1xuICAgICAgICAvLyBhdHRyaWJ1dGVzOiB0cnVlLFxuICAgICAgICAvLyBhdHRyaWJ1dGVPbGRWYWx1ZTogdHJ1ZSxcbiAgICAgICAgY2hpbGRMaXN0OiB0cnVlLCAvLyBUaGlzIGlzIGEgbXVzdCBoYXZlIGZvciB0aGUgb2JzZXJ2ZXIgd2l0aCBzdWJ0cmVlXG4gICAgICAgIHN1YnRyZWU6IHRydWUgLy8gU2V0IHRvIHRydWUgaWYgY2hhbmdlcyBtdXN0IGFsc28gYmUgb2JzZXJ2ZWQgaW4gZGVzY2VuZGFudHMuXG4gICAgfTtcbiAgICBjb25zdCBbc2hvdWxkU2tpcCwgc2V0U2hvdWxkU2tpcF0gPSB1c2VTdGF0ZShmYWxzZSk7XG5cbiAgICBmdW5jdGlvbiBzY3JlZW5TaXplQ2hlY2soKSB7XG4gICAgICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA8PSBtb2JpbGVCcmVha3BvaW50KSB7XG4gICAgICAgICAgICBpZiAoc2NyZWVuTW9kZSAhPT0gXCJtb2JpbGVcIikge1xuICAgICAgICAgICAgICAgIHNldFNjZWVuTW9kZShcIm1vYmlsZVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA+IG1vYmlsZUJyZWFrcG9pbnQgJiYgd2luZG93LmlubmVyV2lkdGggPCBkZXNrdG9wQnJlYWtwb2ludCkge1xuICAgICAgICAgICAgaWYgKHNjcmVlbk1vZGUgIT09IFwidGFibGV0XCIpIHtcbiAgICAgICAgICAgICAgICBzZXRTY2Vlbk1vZGUoXCJ0YWJsZXRcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAod2luZG93LmlubmVyV2lkdGggPj0gZGVza3RvcEJyZWFrcG9pbnQpIHtcbiAgICAgICAgICAgIGlmIChzY3JlZW5Nb2RlICE9PSBcImRlc2t0b3BcIikge1xuICAgICAgICAgICAgICAgIHNldFNjZWVuTW9kZShcImRlc2t0b3BcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBDaGVjayB0aGUgbGFzdCBjb2x1bW4gZm9yIGN1c3RvbSBjb250ZW50LiByZXR1cm5zIHRydWUgaWYgaXQncyB0aGUgY2FzZVxuICAgIGZ1bmN0aW9uIGNoZWNrTGFzdENvbHVtbihyb3cpIHtcbiAgICAgICAgLy8gQ2hlY2sgdGhlIFRIIGZvciBjdXN0b20gY29udGVudFxuICAgICAgICBjb25zdCBtb3N0UmlnaHRUSCA9IHJvdy5xdWVyeVNlbGVjdG9yKFwiLnRoOmxhc3Qtb2YtdHlwZVwiKSB8fCByb3cucXVlcnlTZWxlY3RvcihcIi50aDpudGgtbGFzdC1jaGlsZCgyKVwiKTtcbiAgICAgICAgaWYgKG1vc3RSaWdodFRIKSB7XG4gICAgICAgICAgICBpZiAobW9zdFJpZ2h0VEguY2xhc3NMaXN0LmNvbnRhaW5zKFwiY29sdW1uLXNlbGVjdG9yXCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG1vc3RSaWdodFRILnF1ZXJ5U2VsZWN0b3IoXCJzcGFuXCIpLmlubmVySFRNTCA9PT0gXCImbmJzcDtcIikge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDaGVjayB0aGUgVEQgZm9yIGN1c3RvbSBjb250ZW50XG4gICAgICAgIGNvbnN0IE1vc3RSaWdodFREID0gcm93LnF1ZXJ5U2VsZWN0b3IoXCIudGQ6bGFzdC1vZi10eXBlXCIpIHx8IHJvdy5xdWVyeVNlbGVjdG9yKFwiLnRkOm50aC1sYXN0LWNoaWxkKDIpXCIpO1xuICAgICAgICBpZiAoTW9zdFJpZ2h0VEQpIHtcbiAgICAgICAgICAgIGlmIChNb3N0UmlnaHRURC5jbGFzc0xpc3QuY29udGFpbnMoXCJjb2x1bW4tc2VsZWN0b3JcIikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoTW9zdFJpZ2h0VEQucXVlcnlTZWxlY3RvcihcIi50ZC1jdXN0b20tY29udGVudFwiKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBmdW5jdGlvbiB0b2dnbGVUckNvbGxhcHNlKGV2ZW50LCBjaGV2cm9uQnRuKSB7XG4gICAgICAgICAgICBjb25zdCBub3RDb2xsYXBzZWQgPSBbLi4uZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi50ci1jb2xsYXBzaWJsZTpub3QoLnRyLWNvbGxhcHNpYmxlLS1jb2xsYXBzZWQpXCIpXTtcbiAgICAgICAgICAgIGlmIChub3RDb2xsYXBzZWQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgbm90Q29sbGFwc2VkLmZvckVhY2goY2hldnJvblJvdyA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJvd0J0biA9IGNoZXZyb25Sb3cucGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmJ0bi10ZC1jb2xsYXBzZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJvd0J0biAhPT0gY2hldnJvbkJ0bikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hldnJvblJvdy5jbGFzc0xpc3QudG9nZ2xlKFwidHItY29sbGFwc2libGUtLWNvbGxhcHNlZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoZXZyb25Sb3cucGFyZW50RWxlbWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5xdWVyeVNlbGVjdG9yKFwiLmJ0bi10ZC1jb2xsYXBzZVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jbGFzc0xpc3QudG9nZ2xlKFwiYnRuLXRkLWNvbGxhcHNlLS1hY3RpdmVcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2hldnJvbkJ0bi5jbGFzc0xpc3QudG9nZ2xlKFwiYnRuLXRkLWNvbGxhcHNlLS1hY3RpdmVcIik7XG4gICAgICAgICAgICBldmVudC50YXJnZXQuY2xvc2VzdChcIi50clwiKS5xdWVyeVNlbGVjdG9yKFwiLnRyLWNvbGxhcHNpYmxlXCIpLmNsYXNzTGlzdC50b2dnbGUoXCJ0ci1jb2xsYXBzaWJsZS0tY29sbGFwc2VkXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2hlY2sgdGhlIGNvbHVtbiB0byBpbnNlcnQgdGhlIGNoZXZyb25cbiAgICAgICAgZnVuY3Rpb24gcmVuZGVyQ2hldnJvbihyb3cpIHtcbiAgICAgICAgICAgIC8vIENoZWNrIGZpcnN0IFRIIGlmIHRoZXJlIGlzIG5vIGNoZXZyb24gcHJlc2VudFxuICAgICAgICAgICAgaWYgKCFyb3cucXVlcnlTZWxlY3RvcihcIi50aC5jaGV2cm9uLXRoXCIpKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0VEggPSByb3cucXVlcnlTZWxlY3RvcihcIi50aFwiKTtcbiAgICAgICAgICAgICAgICBjb25zdCBleHRyYVRIID0gYDxkaXYgY2xhc3M9XCJ0aCBjaGV2cm9uLXRoXCIgcm9sZT1cImNvbHVtbmhlYWRlclwiPjxkaXYgY2xhc3M9XCJjb2x1bW4tY29udGFpbmVyXCI+Jm5ic3A7PC9kaXY+PC9kaXY+YDtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZWN0VEggJiYgc2VsZWN0VEgucXVlcnlTZWxlY3RvcihcIi50ZC1jdXN0b20tY29udGVudFwiKSkge1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3RUSC5pbnNlcnRBZGphY2VudEhUTUwoXCJhZnRlcmVuZFwiLCBleHRyYVRIKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNlbGVjdFRIKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdFRILmluc2VydEFkamFjZW50SFRNTChcImJlZm9yZWJlZ2luXCIsIGV4dHJhVEgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQ2hlY2sgZmlyc3QgVEQgaWYgdGhlcmUgaXMgbm8gY2hldnJvbiBwcmVzZW50XG4gICAgICAgICAgICBpZiAoIXJvdy5xdWVyeVNlbGVjdG9yKFwiLnRkLmNoZXZyb24tdGRcIikpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzZWxlY3RURCA9IHJvdy5xdWVyeVNlbGVjdG9yKFwiLnRkXCIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGJvcmRlckNsYXNzID0gcm93LnF1ZXJ5U2VsZWN0b3IoXCIudGQtYm9yZGVyc1wiKSA/IFwidGQtYm9yZGVycyBcIiA6IFwiXCI7XG4gICAgICAgICAgICAgICAgY29uc3QgZXh0cmFURCA9IGA8ZGl2IGNsYXNzPVwidGQgJHtib3JkZXJDbGFzc31jaGV2cm9uLXRkIGJ0bi10ZC1jb2xsYXBzZVwiIHJvbGU9XCJncmlkY2VsbFwiPjxkaXYgY2xhc3M9XCJ0ZC1jdXN0b20tY29udGVudFwiPjxzdmcgaGVpZ2h0PVwiMTZcIiB3aWR0aD1cIjE2XCIgdmlld0JveD1cIjAgMCAxNiAxNlwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIj48cGF0aCBkPVwiTTguMDAwMDQgMTEuMTM2OUM4LjIxMDMzIDExLjEzNjkgOC4zODc0MSAxMS4wNTM5IDguNTQ3ODkgMTAuODkzNEwxMi40OTM1IDYuODUzNjhDMTIuNjIwOCA2LjcyMDg3IDEyLjY4NzIgNi41NjU5MiAxMi42ODcyIDYuMzc3NzdDMTIuNjg3MiA1Ljk5MDQgMTIuMzgyOSA1LjY4NjA0IDEyLjAwNjYgNS42ODYwNEMxMS44MjM5IDUuNjg2MDQgMTEuNjQ2OSA1Ljc2MzUxIDExLjUwODUgNS45MDE4Nkw4LjAwNTU3IDkuNTA0MzlMNC40OTE1OCA1LjkwMTg2QzQuMzU4NzYgNS43NjkwNCA0LjE4NzIyIDUuNjg2MDQgMy45OTM1MyA1LjY4NjA0QzMuNjE3MjMgNS42ODYwNCAzLjMxMjg3IDUuOTkwNCAzLjMxMjg3IDYuMzc3NzdDMy4zMTI4NyA2LjU2MDM4IDMuMzg0ODEgNi43MjA4NyAzLjUxMjA4IDYuODUzNjhMNy40NTc3MiAxMC44OTM0QzcuNjIzNzQgMTEuMDU5NCA3Ljc5NTI5IDExLjEzNjkgOC4wMDAwNCAxMS4xMzY5WlwiLz48L3N2Zz48L2Rpdj48L2Rpdj5gO1xuICAgICAgICAgICAgICAgIGlmIChzZWxlY3RURCAmJiBzZWxlY3RURC5xdWVyeVNlbGVjdG9yKFwiLnRkLWN1c3RvbS1jb250ZW50XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdFRELmluc2VydEFkamFjZW50SFRNTChcImFmdGVyZW5kXCIsIGV4dHJhVEQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc2VsZWN0VEQpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0VEQuaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYmVmb3JlYmVnaW5cIiwgZXh0cmFURCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gcmVuZGVyQ29sbGFwc2libGVEaXYocm93KSB7XG4gICAgICAgICAgICBjb25zdCBjb2xsYXBzaWJsZURpdiA9IGA8ZGl2IGNsYXNzPVwidHItY29sbGFwc2libGUgdHItY29sbGFwc2libGUtLWNvbGxhcHNlZFwiPjwvZGl2PmA7XG4gICAgICAgICAgICBpZiAoIXJvdy5xdWVyeVNlbGVjdG9yKFwiLnRyLWNvbGxhcHNpYmxlXCIpKSB7XG4gICAgICAgICAgICAgICAgcm93Lmluc2VydEFkamFjZW50SFRNTChcImJlZm9yZWVuZFwiLCBjb2xsYXBzaWJsZURpdik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBtb3ZlQ29sdW1uc0luc2lkZUNvbGxhcHNpYmxlRGl2KHJvdykge1xuICAgICAgICAgICAgY29uc3QgZW5kc1dpdGhDdXN0b21Db250ZW50ID0gY2hlY2tMYXN0Q29sdW1uKHJvdyk7XG4gICAgICAgICAgICBjb25zdCBvZmZzZXQgPSBlbmRzV2l0aEN1c3RvbUNvbnRlbnQgPyAtMSA6IDA7XG4gICAgICAgICAgICBjb25zdCB2aXNpYmxlQ29sdW1ucyA9IHNjcmVlbk1vZGUgPT09IFwibW9iaWxlXCIgPyBtYXhDb2x1bW5zTW9iaWxlIDogbWF4Q29sdW1uc1RhYmxldDtcbiAgICAgICAgICAgIGNvbnN0IFRIcyA9IFsuLi5yb3cucXVlcnlTZWxlY3RvckFsbChcIi50aFwiKV07XG4gICAgICAgICAgICBpZiAoVEhzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIFRIcy5zbGljZShUSHMubGVuZ3RoIC0gKFRIcy5sZW5ndGggLSB2aXNpYmxlQ29sdW1ucykgLSBvZmZzZXQpLmZvckVhY2goVEggPT4ge1xuICAgICAgICAgICAgICAgICAgICBUSC5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBURHMgPSBbLi4ucm93LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGRcIildO1xuICAgICAgICAgICAgaWYgKFREcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdURHMgPSBURHMuc2xpY2UoVERzLmxlbmd0aCAtIChURHMubGVuZ3RoIC0gdmlzaWJsZUNvbHVtbnMpIC0gb2Zmc2V0KTtcbiAgICAgICAgICAgICAgICBuZXdURHMuZm9yRWFjaCgoVEQsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIFRELmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhlYWRlcnMgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5kYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJy53aWRnZXQtZGF0YWdyaWQgLnRyW3JvbGU9XCJyb3dcIl06Zmlyc3QtY2hpbGQgLnRoLmhpZGRlbidcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sbGFwc2libGUgPSByb3cucXVlcnlTZWxlY3RvcihcIi50ci1jb2xsYXBzaWJsZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sbGFwc2libGVDb250ZW50ID0gYDxkaXYgY2xhc3M9XCJ0ci1jb2xsYXBzaWJsZV9faXRlbVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJ0ZC10ZXh0IHRleHQtYm9sZCBub21hcmdpblwiPiR7aGVhZGVyc1tpbmRleF0/LnF1ZXJ5U2VsZWN0b3IoXCJzcGFuXCIpLmlubmVySFRNTH08L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0ZC10ZXh0XCI+JHtURC5xdWVyeVNlbGVjdG9yKFwic3BhblwiKT8uaW5uZXJIVE1MfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PmA7XG4gICAgICAgICAgICAgICAgICAgIGNvbGxhcHNpYmxlLmluc2VydEFkamFjZW50SFRNTChcImJlZm9yZWVuZFwiLCBjb2xsYXBzaWJsZUNvbnRlbnQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gcmVuZGVyRWxlbWVudHMoKSB7XG4gICAgICAgICAgICAvLyBQcm9jZXNzIGVhY2ggcm93XG4gICAgICAgICAgICBjb25zdCByb3dzID0gWy4uLmRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQucXVlcnlTZWxlY3RvckFsbChcIi50cltyb2xlPXJvd11cIildO1xuICAgICAgICAgICAgcm93cy5mb3JFYWNoKHJvdyA9PiB7XG4gICAgICAgICAgICAgICAgcmVuZGVyQ29sbGFwc2libGVEaXYocm93KTtcbiAgICAgICAgICAgICAgICBtb3ZlQ29sdW1uc0luc2lkZUNvbGxhcHNpYmxlRGl2KHJvdyk7XG4gICAgICAgICAgICAgICAgcmVuZGVyQ2hldnJvbihyb3cpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGNvbnN0IGNoZXZyb25CdG5zID0gWy4uLmRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQucXVlcnlTZWxlY3RvckFsbChcIi5idG4tdGQtY29sbGFwc2VcIildO1xuICAgICAgICAgICAgY2hldnJvbkJ0bnMuZm9yRWFjaChjaGV2cm9uQnRuID0+XG4gICAgICAgICAgICAgICAgY2hldnJvbkJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZXZlbnQgPT4gdG9nZ2xlVHJDb2xsYXBzZShldmVudCwgY2hldnJvbkJ0bikpXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gcmVzZXRDb2xsYXBzaWJsZXMoKSB7XG4gICAgICAgICAgICBjb25zdCBhbGxDb2xsYXBzaWJsZXMgPSBbLi4uZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnRyLWNvbGxhcHNpYmxlXCIpXTtcbiAgICAgICAgICAgIGFsbENvbGxhcHNpYmxlcy5mb3JFYWNoKGNvbGxhcHNpYmxlID0+IGNvbGxhcHNpYmxlLnJlbW92ZSgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHJlc2V0SGlkZGVuQ29sdW1ucygpIHtcbiAgICAgICAgICAgIGNvbnN0IGhpZGRlbkNvbHVtbnMgPSBbLi4uZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnRoLmhpZGRlbiwgLnRkLmhpZGRlblwiKV07XG4gICAgICAgICAgICBoaWRkZW5Db2x1bW5zLmZvckVhY2goaGlkZGVuQ29sdW1uID0+IGhpZGRlbkNvbHVtbi5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHJlc2V0Q2hldnJvbnMoKSB7XG4gICAgICAgICAgICBjb25zdCByb3dzID0gWy4uLmRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQucXVlcnlTZWxlY3RvckFsbCgnLnRyW3JvbGU9XCJyb3dcIl0nKV07XG4gICAgICAgICAgICByb3dzLmZvckVhY2gocm93ID0+IHtcbiAgICAgICAgICAgICAgICByb3cucXVlcnlTZWxlY3RvcihcIi50aC5jaGV2cm9uLXRoXCIpPy5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICByb3cucXVlcnlTZWxlY3RvcihcIi50ZC5jaGV2cm9uLXRkXCIpPy5yZW1vdmUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gb25Tb3J0KCkge1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzZXRDb2xsYXBzaWJsZXMoKTtcbiAgICAgICAgICAgICAgICByZXNldEhpZGRlbkNvbHVtbnMoKTtcbiAgICAgICAgICAgICAgICByZXNldENoZXZyb25zKCk7XG4gICAgICAgICAgICAgICAgcmVuZGVyRWxlbWVudHMoKTtcbiAgICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBjaGVja0ZvclNvcnRpbmcoKSB7XG4gICAgICAgICAgICBjb25zdCByb3dzID0gWy4uLmRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQucXVlcnlTZWxlY3RvckFsbChcIi50cltyb2xlPXJvd11cIildO1xuICAgICAgICAgICAgY29uc3QgaGVhZGVycyA9IFsuLi5yb3dzWzBdLnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGhcIildO1xuICAgICAgICAgICAgaGVhZGVycy5mb3JFYWNoKGhlYWRlciA9PiBoZWFkZXIuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIG9uU29ydCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNhblJlbmRlciAmJiBzY3JlZW5Nb2RlKSB7XG4gICAgICAgICAgICAvLyBGb3IgZGVza3RvcCBsZWF2ZSAvIHJlc3RvcmUgZGVmYXVsdC4gRm9yIG90aGVyIHNpdHVhdGlvbnMgdXBkYXRlIHRvIG1vYmlsZSAvIHRhYmxldCBjb2x1bW5zXG4gICAgICAgICAgICBpZiAoc2NyZWVuTW9kZSA9PT0gXCJkZXNrdG9wXCIpIHtcbiAgICAgICAgICAgICAgICB0YWJsZUNvbnRlbnQuc2V0QXR0cmlidXRlKFwic3R5bGVcIiwgdGVtcGxhdGVDb2x1bW5zKTtcbiAgICAgICAgICAgICAgICByZXNldENvbGxhcHNpYmxlcygpO1xuICAgICAgICAgICAgICAgIHJlc2V0SGlkZGVuQ29sdW1ucygpO1xuICAgICAgICAgICAgICAgIHJlc2V0Q2hldnJvbnMoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZW5kc1dpdGhDdXN0b21Db250ZW50ID0gY2hlY2tMYXN0Q29sdW1uKFxuICAgICAgICAgICAgICAgICAgICBkYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2lkZ2V0LWRhdGFncmlkIC50cltyb2xlPSdyb3cnXTpudGgtY2hpbGQoMilcIilcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGNvbnN0IG9mZnNldCA9IGVuZHNXaXRoQ3VzdG9tQ29udGVudCA/IC0xIDogMDtcbiAgICAgICAgICAgICAgICBjb25zdCBjb2x1bW5BcnJheSA9IHRlbXBsYXRlQ29sdW1ucy5yZXBsYWNlKFwiZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiBcIiwgXCJcIikuc3BsaXQoXCIgXCIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZpc2libGVDb2x1bW5zID0gc2NyZWVuTW9kZSA9PT0gXCJtb2JpbGVcIiA/IG1heENvbHVtbnNNb2JpbGUgOiBtYXhDb2x1bW5zVGFibGV0O1xuICAgICAgICAgICAgICAgIGNvbnN0IG1heENvbHVtbkFycmF5ID0gY29sdW1uQXJyYXkuc2xpY2UoY29sdW1uQXJyYXkubGVuZ3RoIC0gdmlzaWJsZUNvbHVtbnMgLSBvZmZzZXQpOyAvLyByZW1vdmUgYWxsIGJ1dCB0aGUgbGFzdCBtYXhDb2x1bW5zTW9iaWxlXG5cbiAgICAgICAgICAgICAgICBpZiAob2Zmc2V0KSB7XG4gICAgICAgICAgICAgICAgICAgIG1heENvbHVtbkFycmF5LnB1c2goXCJmaXQtY29udGVudCgxMDAlKVwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbWF4Q29sdW1uQXJyYXkuam9pbihcIiBcIikucmVwbGFjZShcIjtcIiwgXCJcIik7XG4gICAgICAgICAgICAgICAgbWF4Q29sdW1uQXJyYXkudW5zaGlmdChcImZpdC1jb250ZW50KDEwMCUpXCIpOyAvLyBhZGQgbmV3IGNvbHVtbiBmb3IgdGhlIGNoZXZyb25cbiAgICAgICAgICAgICAgICBtYXhDb2x1bW5BcnJheS5zcGxpY2UoMiwgMSwgXCIxZnJcIik7IC8vIGNvbnZlcnQgYXQgbGVhc3Qgb25lIGF1dG8tZmlsbCBjb2x1bW4gdG8gYXV0by1maWxsXG4gICAgICAgICAgICAgICAgdGFibGVDb250ZW50LnNldEF0dHJpYnV0ZShcbiAgICAgICAgICAgICAgICAgICAgXCJzdHlsZVwiLFxuICAgICAgICAgICAgICAgICAgICBgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiAke21heENvbHVtbkFycmF5LmpvaW4oXCIgXCIpLnJlcGxhY2UoXCI7XCIsIFwiXCIpfTtgXG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgIHJlc2V0Q29sbGFwc2libGVzKCk7XG4gICAgICAgICAgICAgICAgcmVzZXRIaWRkZW5Db2x1bW5zKCk7XG4gICAgICAgICAgICAgICAgcmVzZXRDaGV2cm9ucygpO1xuXG4gICAgICAgICAgICAgICAgcmVuZGVyRWxlbWVudHMoKTtcbiAgICAgICAgICAgICAgICBjaGVja0ZvclNvcnRpbmcoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigoKSA9PiB7XG4gICAgICAgICAgICBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICBpZiAoZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudCkge1xuICAgICAgICAgICAgICAgIHNldFRhYmxlQ29udGVudChkYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2lkZ2V0LWRhdGFncmlkIC53aWRnZXQtZGF0YWdyaWQtZ3JpZC1ib2R5XCIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9ic2VydmVyLm9ic2VydmUoZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudCwgY29uZmlnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGRhdGFncmlkV2lkZ2V0UmVmICYmIGRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIG9ic2VydmVyLm9ic2VydmUoZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudCwgY29uZmlnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoKSA9PiBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgfSk7XG5cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBpZiAodGFibGVDb250ZW50KSB7XG4gICAgICAgICAgICBzZXRUZW1wbGF0ZUNvbHVtbnModGFibGVDb250ZW50LmdldEF0dHJpYnV0ZShcInN0eWxlXCIpKTtcbiAgICAgICAgICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA8PSBtb2JpbGVCcmVha3BvaW50KSB7XG4gICAgICAgICAgICAgICAgc2V0U2NlZW5Nb2RlKFwibW9iaWxlXCIpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA+IG1vYmlsZUJyZWFrcG9pbnQgJiYgd2luZG93LmlubmVyV2lkdGggPCBkZXNrdG9wQnJlYWtwb2ludCkge1xuICAgICAgICAgICAgICAgIHNldFNjZWVuTW9kZShcInRhYmxldFwiKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAod2luZG93LmlubmVyV2lkdGggPj0gZGVza3RvcEJyZWFrcG9pbnQpIHtcbiAgICAgICAgICAgICAgICBzZXRTY2Vlbk1vZGUoXCJkZXNrdG9wXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2V0Q2FuUmVuZGVyKHRydWUpO1xuICAgICAgICB9XG4gICAgfSwgW2Rlc2t0b3BCcmVha3BvaW50LCBtb2JpbGVCcmVha3BvaW50LCB0YWJsZUNvbnRlbnRdKTtcblxuICAgIGlmIChjYW5SZW5kZXIpIHtcbiAgICAgICAgaWYgKHNob3VsZFNraXAgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBzZXRTaG91bGRTa2lwKHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHNjcmVlblNpemVDaGVjayk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e2ByZXNwb25zaXZlLWRhdGFncmlkICR7c3R5bGV9YH0gcmVmPXtkYXRhZ3JpZFdpZGdldFJlZn0+XG4gICAgICAgICAgICB7ZGF0YUdyaWRXaWRnZXR9XG4gICAgICAgIDwvZGl2PlxuICAgICk7XG59XG4iXSwibmFtZXMiOlsiUmVzcG9uc2l2ZURhdGFncmlkVHdvIiwiZGF0YUdyaWRXaWRnZXQiLCJkZXNrdG9wQnJlYWtwb2ludCIsIm1heENvbHVtbnNNb2JpbGUiLCJtYXhDb2x1bW5zVGFibGV0IiwibW9iaWxlQnJlYWtwb2ludCIsInJlc3QiLCJzdHlsZSIsImNsYXNzIiwiZGF0YWdyaWRXaWRnZXRSZWYiLCJ1c2VSZWYiLCJ0YWJsZUNvbnRlbnQiLCJzZXRUYWJsZUNvbnRlbnQiLCJ1c2VTdGF0ZSIsImNhblJlbmRlciIsInNldENhblJlbmRlciIsInRlbXBsYXRlQ29sdW1ucyIsInNldFRlbXBsYXRlQ29sdW1ucyIsInNjcmVlbk1vZGUiLCJzZXRTY2Vlbk1vZGUiLCJjb25maWciLCJjaGlsZExpc3QiLCJzdWJ0cmVlIiwic2hvdWxkU2tpcCIsInNldFNob3VsZFNraXAiLCJzY3JlZW5TaXplQ2hlY2siLCJ3aW5kb3ciLCJpbm5lcldpZHRoIiwiY2hlY2tMYXN0Q29sdW1uIiwicm93IiwibW9zdFJpZ2h0VEgiLCJxdWVyeVNlbGVjdG9yIiwiY2xhc3NMaXN0IiwiY29udGFpbnMiLCJpbm5lckhUTUwiLCJNb3N0UmlnaHRURCIsInVzZUVmZmVjdCIsInRvZ2dsZVRyQ29sbGFwc2UiLCJldmVudCIsImNoZXZyb25CdG4iLCJub3RDb2xsYXBzZWQiLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJsZW5ndGgiLCJmb3JFYWNoIiwiY2hldnJvblJvdyIsInJvd0J0biIsInBhcmVudEVsZW1lbnQiLCJ0b2dnbGUiLCJ0YXJnZXQiLCJjbG9zZXN0IiwicmVuZGVyQ2hldnJvbiIsInNlbGVjdFRIIiwiZXh0cmFUSCIsImluc2VydEFkamFjZW50SFRNTCIsInNlbGVjdFREIiwiYm9yZGVyQ2xhc3MiLCJleHRyYVREIiwicmVuZGVyQ29sbGFwc2libGVEaXYiLCJjb2xsYXBzaWJsZURpdiIsIm1vdmVDb2x1bW5zSW5zaWRlQ29sbGFwc2libGVEaXYiLCJlbmRzV2l0aEN1c3RvbUNvbnRlbnQiLCJvZmZzZXQiLCJ2aXNpYmxlQ29sdW1ucyIsIlRIcyIsInNsaWNlIiwiVEgiLCJhZGQiLCJURHMiLCJuZXdURHMiLCJURCIsImluZGV4IiwiaGVhZGVycyIsImN1cnJlbnQiLCJjb2xsYXBzaWJsZSIsImNvbGxhcHNpYmxlQ29udGVudCIsInJlbmRlckVsZW1lbnRzIiwicm93cyIsImNoZXZyb25CdG5zIiwiYWRkRXZlbnRMaXN0ZW5lciIsInJlc2V0Q29sbGFwc2libGVzIiwiYWxsQ29sbGFwc2libGVzIiwicmVtb3ZlIiwicmVzZXRIaWRkZW5Db2x1bW5zIiwiaGlkZGVuQ29sdW1ucyIsImhpZGRlbkNvbHVtbiIsInJlc2V0Q2hldnJvbnMiLCJvblNvcnQiLCJzZXRUaW1lb3V0IiwiY2hlY2tGb3JTb3J0aW5nIiwiaGVhZGVyIiwic2V0QXR0cmlidXRlIiwiY29sdW1uQXJyYXkiLCJyZXBsYWNlIiwic3BsaXQiLCJtYXhDb2x1bW5BcnJheSIsInB1c2giLCJqb2luIiwidW5zaGlmdCIsInNwbGljZSIsIm9ic2VydmVyIiwiTXV0YXRpb25PYnNlcnZlciIsImRpc2Nvbm5lY3QiLCJvYnNlcnZlIiwiZ2V0QXR0cmlidXRlIiwiY3JlYXRlRWxlbWVudCIsImNsYXNzTmFtZSIsInJlZiJdLCJtYXBwaW5ncyI6Ijs7SUFHTyxTQUFTQSxxQkFBcUJBLENBQUM7TUFDbENDLGNBQWM7TUFDZEMsaUJBQWlCO01BQ2pCQyxnQkFBZ0I7TUFDaEJDLGdCQUFnQjtNQUNoQkMsZ0JBQWdCO01BQ2hCLEdBQUdDLElBQUFBO0lBQ1AsQ0FBQyxFQUFFO0lBQ0MsRUFBQSxNQUFNQyxLQUFLLEdBQUdELElBQUksQ0FBQ0UsS0FBSyxJQUFJLEVBQUUsQ0FBQTtJQUM5QixFQUFBLE1BQU1DLGlCQUFpQixHQUFHQyxZQUFNLENBQUMsSUFBSSxDQUFDLENBQUE7TUFDdEMsTUFBTSxDQUFDQyxZQUFZLEVBQUVDLGVBQWUsQ0FBQyxHQUFHQyxjQUFRLENBQUMsSUFBSSxDQUFDLENBQUE7TUFDdEQsTUFBTSxDQUFDQyxTQUFTLEVBQUVDLFlBQVksQ0FBQyxHQUFHRixjQUFRLENBQUMsS0FBSyxDQUFDLENBQUE7TUFDakQsTUFBTSxDQUFDRyxlQUFlLEVBQUVDLGtCQUFrQixDQUFDLEdBQUdKLGNBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtNQUM1RCxNQUFNLENBQUNLLFVBQVUsRUFBRUMsWUFBWSxDQUFDLEdBQUdOLGNBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUNqRCxFQUFBLE1BQU1PLE1BQU0sR0FBRztJQUNYO0lBQ0E7SUFDQUMsSUFBQUEsU0FBUyxFQUFFLElBQUk7SUFBRTtRQUNqQkMsT0FBTyxFQUFFLElBQUk7T0FDaEIsQ0FBQTtNQUNELE1BQU0sQ0FBQ0MsVUFBVSxFQUFFQyxhQUFhLENBQUMsR0FBR1gsY0FBUSxDQUFDLEtBQUssQ0FBQyxDQUFBO01BRW5ELFNBQVNZLGVBQWVBLEdBQUc7SUFDdkIs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
