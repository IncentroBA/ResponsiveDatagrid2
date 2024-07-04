define(['exports', 'react'], (function (exports, react) { 'use strict';

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzcG9uc2l2ZURhdGFncmlkVHdvLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvUmVzcG9uc2l2ZURhdGFncmlkVHdvLmpzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgXCIuL3VpL1Jlc3BvbnNpdmVEYXRhZ3JpZFR3by5jc3NcIjtcbmltcG9ydCB7IGNyZWF0ZUVsZW1lbnQsIHVzZUVmZmVjdCwgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuXG5leHBvcnQgZnVuY3Rpb24gUmVzcG9uc2l2ZURhdGFncmlkVHdvKHtcbiAgICBkYXRhR3JpZFdpZGdldCxcbiAgICBkZXNrdG9wQnJlYWtwb2ludCxcbiAgICBrZWVwTGFzdEJvb2xlYW4sXG4gICAgbWF4Q29sdW1uc01vYmlsZSxcbiAgICBtYXhDb2x1bW5zVGFibGV0LFxuICAgIGZvcmNlQXV0b0ZpbGwsXG4gICAgbW9iaWxlQnJlYWtwb2ludCxcbiAgICBSZW5kZXJDaGV2cm9uLFxuICAgIC4uLnJlc3Rcbn0pIHtcbiAgICBjb25zdCBzdHlsZSA9IHJlc3QuY2xhc3MgfHwgXCJcIjtcbiAgICBjb25zdCBkYXRhZ3JpZFdpZGdldFJlZiA9IHVzZVJlZihudWxsKTtcbiAgICBjb25zdCBkYXRhZ3JpZFJvd3NSZWYgPSB1c2VSZWYoW10pO1xuICAgIGNvbnN0IFt0YWJsZUNvbnRlbnQsIHNldFRhYmxlQ29udGVudF0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbY2FuUmVuZGVyLCBzZXRDYW5SZW5kZXJdID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IFt0ZW1wbGF0ZUNvbHVtbnMsIHNldFRlbXBsYXRlQ29sdW1uc10gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbc2NyZWVuTW9kZSwgc2V0U2NlZW5Nb2RlXSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IGNvbmZpZyA9IHtcbiAgICAgICAgLy8gYXR0cmlidXRlczogdHJ1ZSxcbiAgICAgICAgLy8gYXR0cmlidXRlT2xkVmFsdWU6IHRydWUsXG4gICAgICAgIGNoaWxkTGlzdDogdHJ1ZSwgLy8gVGhpcyBpcyBhIG11c3QgaGF2ZSBmb3IgdGhlIG9ic2VydmVyIHdpdGggc3VidHJlZVxuICAgICAgICBzdWJ0cmVlOiB0cnVlIC8vIFNldCB0byB0cnVlIGlmIGNoYW5nZXMgbXVzdCBhbHNvIGJlIG9ic2VydmVkIGluIGRlc2NlbmRhbnRzLlxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBzY3JlZW5TaXplQ2hlY2soKSB7XG4gICAgICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA8PSBtb2JpbGVCcmVha3BvaW50KSB7XG4gICAgICAgICAgICBpZiAoc2NyZWVuTW9kZSAhPT0gXCJtb2JpbGVcIikge1xuICAgICAgICAgICAgICAgIHNldFNjZWVuTW9kZShcIm1vYmlsZVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA+IG1vYmlsZUJyZWFrcG9pbnQgJiYgd2luZG93LmlubmVyV2lkdGggPCBkZXNrdG9wQnJlYWtwb2ludCkge1xuICAgICAgICAgICAgaWYgKHNjcmVlbk1vZGUgIT09IFwidGFibGV0XCIpIHtcbiAgICAgICAgICAgICAgICBzZXRTY2Vlbk1vZGUoXCJ0YWJsZXRcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAod2luZG93LmlubmVyV2lkdGggPj0gZGVza3RvcEJyZWFrcG9pbnQpIHtcbiAgICAgICAgICAgIGlmIChzY3JlZW5Nb2RlICE9PSBcImRlc2t0b3BcIikge1xuICAgICAgICAgICAgICAgIHNldFNjZWVuTW9kZShcImRlc2t0b3BcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBmdW5jdGlvbiBzZXRHcmlkQ29sdW1ucygpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbHVtbkFycmF5ID0gdGVtcGxhdGVDb2x1bW5zLnJlcGxhY2UoXCJncmlkLXRlbXBsYXRlLWNvbHVtbnM6IFwiLCBcIlwiKS5zcGxpdCgvICg/IVteKCldKlxcKSkvKTtcbiAgICAgICAgICAgIGNvbnN0IHZpc2libGVDb2x1bW5zID0gc2NyZWVuTW9kZSA9PT0gXCJtb2JpbGVcIiA/IG1heENvbHVtbnNNb2JpbGUgOiBtYXhDb2x1bW5zVGFibGV0O1xuICAgICAgICAgICAgY29uc3QgbWF4Q29sdW1uQXJyYXkgPSBjb2x1bW5BcnJheS5zbGljZShcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIGNvbHVtbkFycmF5Lmxlbmd0aCAtIChjb2x1bW5BcnJheS5sZW5ndGggLSB2aXNpYmxlQ29sdW1ucykgKyAoa2VlcExhc3RCb29sZWFuID8gLTEgOiAwKVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgaWYgKGtlZXBMYXN0Qm9vbGVhbikge1xuICAgICAgICAgICAgICAgIG1heENvbHVtbkFycmF5LnB1c2goXCJmaXQtY29udGVudCgxMDAlKVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG1heENvbHVtbkFycmF5LmpvaW4oXCIgXCIpLnJlcGxhY2UoXCI7XCIsIFwiXCIpO1xuXG4gICAgICAgICAgICBpZiAoUmVuZGVyQ2hldnJvbiA9PT0gXCJyaWdodFwiKSB7XG4gICAgICAgICAgICAgICAgbWF4Q29sdW1uQXJyYXkucHVzaChcImZpdC1jb250ZW50KDEwMCUpXCIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBtYXhDb2x1bW5BcnJheS51bnNoaWZ0KFwiZml0LWNvbnRlbnQoMTAwJSlcIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChmb3JjZUF1dG9GaWxsKSB7XG4gICAgICAgICAgICAgICAgbWF4Q29sdW1uQXJyYXkuc3BsaWNlKDIsIDEsIFwiMWZyXCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0YWJsZUNvbnRlbnQuc2V0QXR0cmlidXRlKFwic3R5bGVcIiwgYGdyaWQtdGVtcGxhdGUtY29sdW1uczogJHttYXhDb2x1bW5BcnJheS5qb2luKFwiIFwiKS5yZXBsYWNlKFwiO1wiLCBcIlwiKX07YCk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiB0b2dnbGVUckNvbGxhcHNlKGV2ZW50LCBjaGV2cm9uQnRuKSB7XG4gICAgICAgICAgICBjb25zdCBub3RDb2xsYXBzZWQgPSBbXG4gICAgICAgICAgICAgICAgLi4uZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi50ci1yZXNwLWNvbGxhcHNpYmxlOm5vdCgudHItcmVzcC1jb2xsYXBzaWJsZS0tY29sbGFwc2VkKVwiKVxuICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIGlmIChub3RDb2xsYXBzZWQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgbm90Q29sbGFwc2VkLmZvckVhY2goY2hldnJvblJvdyA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJvd0J0biA9IGNoZXZyb25Sb3cucGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmJ0bi10ZC1yZXNwLWNvbGxhcHNlXCIpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocm93QnRuICE9PSBjaGV2cm9uQnRuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGV2cm9uUm93LmNsYXNzTGlzdC50b2dnbGUoXCJ0ci1yZXNwLWNvbGxhcHNpYmxlLS1jb2xsYXBzZWRcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGV2cm9uUm93LnBhcmVudEVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucXVlcnlTZWxlY3RvcihcIi5idG4tdGQtcmVzcC1jb2xsYXBzZVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jbGFzc0xpc3QudG9nZ2xlKFwiYnRuLXRkLXJlc3AtY29sbGFwc2UtLWFjdGl2ZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjaGV2cm9uQnRuLmNsYXNzTGlzdC50b2dnbGUoXCJidG4tdGQtcmVzcC1jb2xsYXBzZS0tYWN0aXZlXCIpO1xuICAgICAgICAgICAgZXZlbnQudGFyZ2V0XG4gICAgICAgICAgICAgICAgLmNsb3Nlc3QoXCIudHJcIilcbiAgICAgICAgICAgICAgICAucXVlcnlTZWxlY3RvcihcIi50ci1yZXNwLWNvbGxhcHNpYmxlXCIpXG4gICAgICAgICAgICAgICAgLmNsYXNzTGlzdC50b2dnbGUoXCJ0ci1yZXNwLWNvbGxhcHNpYmxlLS1jb2xsYXBzZWRcIik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDaGVjayB0aGUgY29sdW1uIHRvIGluc2VydCB0aGUgY2hldnJvblxuICAgICAgICBmdW5jdGlvbiByZW5kZXJDaGV2cm9uKHJvdykge1xuICAgICAgICAgICAgY29uc3QgdmlzaWJsZUNvbHVtbnMgPSBzY3JlZW5Nb2RlID09PSBcIm1vYmlsZVwiID8gbWF4Q29sdW1uc01vYmlsZSA6IG1heENvbHVtbnNUYWJsZXQ7XG4gICAgICAgICAgICAvLyBDaGVjayBmaXJzdCBUSCBpZiB0aGVyZSBpcyBubyBjaGV2cm9uIHByZXNlbnRcbiAgICAgICAgICAgIGlmICghcm93LnF1ZXJ5U2VsZWN0b3IoXCIudGguY2hldnJvbi10aFwiKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNlbGVjdFRIID1cbiAgICAgICAgICAgICAgICAgICAgUmVuZGVyQ2hldnJvbiA9PT0gXCJsZWZ0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgID8gcm93LnF1ZXJ5U2VsZWN0b3IoXCIudGhcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIDogcm93LnF1ZXJ5U2VsZWN0b3IoYC50aDpudGgtY2hpbGQoJHt2aXNpYmxlQ29sdW1ucyArIDF9KWApO1xuICAgICAgICAgICAgICAgIGNvbnN0IGV4dHJhVEggPSBgPGRpdiBjbGFzcz1cInRoIGNoZXZyb24tdGhcIiByb2xlPVwiY29sdW1uaGVhZGVyXCI+PGRpdiBjbGFzcz1cImNvbHVtbi1jb250YWluZXJcIj4mbmJzcDs8L2Rpdj48L2Rpdj5gO1xuICAgICAgICAgICAgICAgIGlmIChzZWxlY3RUSCAmJiBzZWxlY3RUSC5xdWVyeVNlbGVjdG9yKFwiLnRkLWN1c3RvbS1jb250ZW50XCIpICYmIFJlbmRlckNoZXZyb24gPT09IFwibGVmdFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdFRILmluc2VydEFkamFjZW50SFRNTChcImFmdGVyZW5kXCIsIGV4dHJhVEgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc2VsZWN0VEgpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0VEguaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYmVmb3JlYmVnaW5cIiwgZXh0cmFUSCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDaGVjayBmaXJzdCBURCBpZiB0aGVyZSBpcyBubyBjaGV2cm9uIHByZXNlbnRcbiAgICAgICAgICAgIGlmICghcm93LnF1ZXJ5U2VsZWN0b3IoXCIudGQuY2hldnJvbi10ZFwiKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNlbGVjdFREID1cbiAgICAgICAgICAgICAgICAgICAgUmVuZGVyQ2hldnJvbiA9PT0gXCJsZWZ0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgID8gcm93LnF1ZXJ5U2VsZWN0b3IoXCIudGRcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIDogcm93LnF1ZXJ5U2VsZWN0b3IoYC50ZDpudGgtY2hpbGQoJHt2aXNpYmxlQ29sdW1ucyArIDF9KWApO1xuICAgICAgICAgICAgICAgIGNvbnN0IGJvcmRlckNsYXNzID0gcm93LnF1ZXJ5U2VsZWN0b3IoXCIudGQtYm9yZGVyc1wiKSA/IFwidGQtYm9yZGVycyBcIiA6IFwiXCI7XG4gICAgICAgICAgICAgICAgY29uc3QgZXh0cmFURCA9IGA8ZGl2IGNsYXNzPVwidGQgJHtib3JkZXJDbGFzc31jaGV2cm9uLXRkIGJ0bi10ZC1yZXNwLWNvbGxhcHNlXCIgcm9sZT1cImdyaWRjZWxsXCI+PGRpdiBjbGFzcz1cInRkLWN1c3RvbS1jb250ZW50XCI+PHN2ZyBoZWlnaHQ9XCIxNlwiIHdpZHRoPVwiMTZcIiB2aWV3Qm94PVwiMCAwIDE2IDE2XCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIGZpbGw9XCJjdXJyZW50Q29sb3JcIj48cGF0aCBkPVwiTTguMDAwMDQgMTEuMTM2OUM4LjIxMDMzIDExLjEzNjkgOC4zODc0MSAxMS4wNTM5IDguNTQ3ODkgMTAuODkzNEwxMi40OTM1IDYuODUzNjhDMTIuNjIwOCA2LjcyMDg3IDEyLjY4NzIgNi41NjU5MiAxMi42ODcyIDYuMzc3NzdDMTIuNjg3MiA1Ljk5MDQgMTIuMzgyOSA1LjY4NjA0IDEyLjAwNjYgNS42ODYwNEMxMS44MjM5IDUuNjg2MDQgMTEuNjQ2OSA1Ljc2MzUxIDExLjUwODUgNS45MDE4Nkw4LjAwNTU3IDkuNTA0MzlMNC40OTE1OCA1LjkwMTg2QzQuMzU4NzYgNS43NjkwNCA0LjE4NzIyIDUuNjg2MDQgMy45OTM1MyA1LjY4NjA0QzMuNjE3MjMgNS42ODYwNCAzLjMxMjg3IDUuOTkwNCAzLjMxMjg3IDYuMzc3NzdDMy4zMTI4NyA2LjU2MDM4IDMuMzg0ODEgNi43MjA4NyAzLjUxMjA4IDYuODUzNjhMNy40NTc3MiAxMC44OTM0QzcuNjIzNzQgMTEuMDU5NCA3Ljc5NTI5IDExLjEzNjkgOC4wMDAwNCAxMS4xMzY5WlwiLz48L3N2Zz48L2Rpdj48L2Rpdj5gO1xuICAgICAgICAgICAgICAgIGlmIChzZWxlY3RURCAmJiBzZWxlY3RURC5xdWVyeVNlbGVjdG9yKFwiLnRkLWN1c3RvbS1jb250ZW50XCIpICYmIFJlbmRlckNoZXZyb24gPT09IFwibGVmdFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdFRELmluc2VydEFkamFjZW50SFRNTChcImFmdGVyZW5kXCIsIGV4dHJhVEQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc2VsZWN0VEQpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0VEQuaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYmVmb3JlYmVnaW5cIiwgZXh0cmFURCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gcmVuZGVyQ29sbGFwc2libGVEaXYocm93KSB7XG4gICAgICAgICAgICBjb25zdCBjb2xsYXBzaWJsZURpdiA9IGA8ZGl2IGNsYXNzPVwidHItcmVzcC1jb2xsYXBzaWJsZSB0ci1yZXNwLWNvbGxhcHNpYmxlLS1jb2xsYXBzZWRcIj48L2Rpdj5gO1xuICAgICAgICAgICAgaWYgKCFyb3cucXVlcnlTZWxlY3RvcihcIi50ci1yZXNwLWNvbGxhcHNpYmxlXCIpKSB7XG4gICAgICAgICAgICAgICAgcm93Lmluc2VydEFkamFjZW50SFRNTChcImJlZm9yZWVuZFwiLCBjb2xsYXBzaWJsZURpdik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBtb3ZlQ29sdW1uc0luc2lkZUNvbGxhcHNpYmxlRGl2KHJvdykge1xuICAgICAgICAgICAgY29uc3QgdmlzaWJsZUNvbHVtbnMgPSBzY3JlZW5Nb2RlID09PSBcIm1vYmlsZVwiID8gbWF4Q29sdW1uc01vYmlsZSA6IG1heENvbHVtbnNUYWJsZXQ7XG4gICAgICAgICAgICBjb25zdCBlbmRJbmRleCA9IGtlZXBMYXN0Qm9vbGVhbiA/IC0xIDogMDtcbiAgICAgICAgICAgIGNvbnN0IFRIcyA9IFsuLi5yb3cucXVlcnlTZWxlY3RvckFsbChcIi50aFwiKV07XG5cbiAgICAgICAgICAgIGlmIChUSHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhcnRJbmRleCA9IFRIcy5sZW5ndGggLSAoVEhzLmxlbmd0aCAtIHZpc2libGVDb2x1bW5zKSArIChrZWVwTGFzdEJvb2xlYW4gPyAtMSA6IDApO1xuXG4gICAgICAgICAgICAgICAgaWYgKGtlZXBMYXN0Qm9vbGVhbikge1xuICAgICAgICAgICAgICAgICAgICBUSHMuc2xpY2Uoc3RhcnRJbmRleCwgZW5kSW5kZXgpLmZvckVhY2goVEggPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgVEguY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgVEhzLnNsaWNlKHN0YXJ0SW5kZXgpLmZvckVhY2goVEggPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgVEguY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBURHMgPSBbLi4ucm93LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGRcIildO1xuICAgICAgICAgICAgaWYgKFREcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzdGFydEluZGV4ID0gVERzLmxlbmd0aCAtIChURHMubGVuZ3RoIC0gdmlzaWJsZUNvbHVtbnMpICsgKGtlZXBMYXN0Qm9vbGVhbiA/IC0xIDogMCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoa2VlcExhc3RCb29sZWFuKSB7XG4gICAgICAgICAgICAgICAgICAgIFREcy5zbGljZShzdGFydEluZGV4LCBlbmRJbmRleCkuZm9yRWFjaCgoVEQsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBURC5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaGVhZGVycyA9IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5kYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcud2lkZ2V0LWRhdGFncmlkIC50cltyb2xlPVwicm93XCJdOmZpcnN0LWNoaWxkIC50aC5oaWRkZW4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbGxhcHNpYmxlID0gcm93LnF1ZXJ5U2VsZWN0b3IoXCIudHItcmVzcC1jb2xsYXBzaWJsZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbGxhcHNpYmxlQ29udGVudCA9IGA8ZGl2IGNsYXNzPVwidHItcmVzcC1jb2xsYXBzaWJsZV9faXRlbVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwidGQtdGV4dCB0ZXh0LWJvbGQgbm9tYXJnaW5cIj4ke2hlYWRlcnNbaW5kZXhdPy5xdWVyeVNlbGVjdG9yKFwic3BhblwiKS5pbm5lckhUTUx9PC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRkLXRleHRcIj4ke1RELnF1ZXJ5U2VsZWN0b3IoXCJzcGFuXCIpPy5pbm5lckhUTUx9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PmA7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xsYXBzaWJsZS5pbnNlcnRBZGphY2VudEhUTUwoXCJiZWZvcmVlbmRcIiwgY29sbGFwc2libGVDb250ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgVERzLnNsaWNlKHN0YXJ0SW5kZXgpLmZvckVhY2goKFRELCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgVEQuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGhlYWRlcnMgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnLndpZGdldC1kYXRhZ3JpZCAudHJbcm9sZT1cInJvd1wiXTpmaXJzdC1jaGlsZCAudGguaGlkZGVuJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb2xsYXBzaWJsZSA9IHJvdy5xdWVyeVNlbGVjdG9yKFwiLnRyLXJlc3AtY29sbGFwc2libGVcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb2xsYXBzaWJsZUNvbnRlbnQgPSBgPGRpdiBjbGFzcz1cInRyLXJlc3AtY29sbGFwc2libGVfX2l0ZW1cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwidGQtdGV4dCB0ZXh0LWJvbGQgbm9tYXJnaW5cIj4ke2hlYWRlcnNbaW5kZXhdPy5xdWVyeVNlbGVjdG9yKFwic3BhblwiKS5pbm5lckhUTUx9PC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidGQtdGV4dFwiPiR7VEQucXVlcnlTZWxlY3RvcihcInNwYW5cIik/LmlubmVySFRNTH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5gO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29sbGFwc2libGUuaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYmVmb3JlZW5kXCIsIGNvbGxhcHNpYmxlQ29udGVudCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHJlbmRlckVsZW1lbnRzKCkge1xuICAgICAgICAgICAgLy8gUHJvY2VzcyBlYWNoIHJvd1xuICAgICAgICAgICAgZGF0YWdyaWRSb3dzUmVmLmN1cnJlbnQuZm9yRWFjaChyb3cgPT4ge1xuICAgICAgICAgICAgICAgIHJlbmRlckNvbGxhcHNpYmxlRGl2KHJvdyk7XG4gICAgICAgICAgICAgICAgbW92ZUNvbHVtbnNJbnNpZGVDb2xsYXBzaWJsZURpdihyb3cpO1xuICAgICAgICAgICAgICAgIHJlbmRlckNoZXZyb24ocm93KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjb25zdCBjaGV2cm9uQnRucyA9IFsuLi5kYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuYnRuLXRkLXJlc3AtY29sbGFwc2VcIildO1xuICAgICAgICAgICAgY2hldnJvbkJ0bnMuZm9yRWFjaChjaGV2cm9uQnRuID0+XG4gICAgICAgICAgICAgICAgY2hldnJvbkJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZXZlbnQgPT4gdG9nZ2xlVHJDb2xsYXBzZShldmVudCwgY2hldnJvbkJ0bikpXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gcmVzZXRDb2xsYXBzaWJsZXMoKSB7XG4gICAgICAgICAgICBjb25zdCBhbGxDb2xsYXBzaWJsZXMgPSBbLi4uZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnRyLXJlc3AtY29sbGFwc2libGVcIildO1xuICAgICAgICAgICAgYWxsQ29sbGFwc2libGVzLmZvckVhY2goY29sbGFwc2libGUgPT4gY29sbGFwc2libGUucmVtb3ZlKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gcmVzZXRIaWRkZW5Db2x1bW5zKCkge1xuICAgICAgICAgICAgY29uc3QgaGlkZGVuQ29sdW1ucyA9IFsuLi5kYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGguaGlkZGVuLCAudGQuaGlkZGVuXCIpXTtcbiAgICAgICAgICAgIGhpZGRlbkNvbHVtbnMuZm9yRWFjaChoaWRkZW5Db2x1bW4gPT4gaGlkZGVuQ29sdW1uLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIikpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gcmVzZXRDaGV2cm9ucygpIHtcbiAgICAgICAgICAgIGNvbnN0IHJvd3MgPSBbLi4uZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudC5xdWVyeVNlbGVjdG9yQWxsKCcudHJbcm9sZT1cInJvd1wiXScpXTtcbiAgICAgICAgICAgIHJvd3MuZm9yRWFjaChyb3cgPT4ge1xuICAgICAgICAgICAgICAgIHJvdy5xdWVyeVNlbGVjdG9yKFwiLnRoLmNoZXZyb24tdGhcIik/LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIHJvdy5xdWVyeVNlbGVjdG9yKFwiLnRkLmNoZXZyb24tdGRcIik/LnJlbW92ZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBvblNvcnQoKSB7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgd2luZG93LmlubmVyV2lkdGggPD0gbW9iaWxlQnJlYWtwb2ludCB8fFxuICAgICAgICAgICAgICAgICh3aW5kb3cuaW5uZXJXaWR0aCA+IG1vYmlsZUJyZWFrcG9pbnQgJiYgd2luZG93LmlubmVyV2lkdGggPCBkZXNrdG9wQnJlYWtwb2ludClcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXNldENvbGxhcHNpYmxlcygpO1xuICAgICAgICAgICAgICAgICAgICByZXNldEhpZGRlbkNvbHVtbnMoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzZXRDaGV2cm9ucygpO1xuICAgICAgICAgICAgICAgICAgICByZW5kZXJFbGVtZW50cygpO1xuICAgICAgICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2FuUmVuZGVyICYmIHNjcmVlbk1vZGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGhlYWRlcnMgPSBbLi4uZGF0YWdyaWRSb3dzUmVmLmN1cnJlbnRbMF0ucXVlcnlTZWxlY3RvckFsbChcIi50aFwiKV07XG5cbiAgICAgICAgICAgIC8vIEZvciBkZXNrdG9wIGxlYXZlIC8gcmVzdG9yZSBkZWZhdWx0LiBGb3Igb3RoZXIgc2l0dWF0aW9ucyB1cGRhdGUgdG8gbW9iaWxlIC8gdGFibGV0IGNvbHVtbnNcbiAgICAgICAgICAgIGlmIChzY3JlZW5Nb2RlID09PSBcImRlc2t0b3BcIikge1xuICAgICAgICAgICAgICAgIHRhYmxlQ29udGVudC5zZXRBdHRyaWJ1dGUoXCJzdHlsZVwiLCB0ZW1wbGF0ZUNvbHVtbnMpO1xuICAgICAgICAgICAgICAgIHJlc2V0Q29sbGFwc2libGVzKCk7XG4gICAgICAgICAgICAgICAgcmVzZXRIaWRkZW5Db2x1bW5zKCk7XG4gICAgICAgICAgICAgICAgcmVzZXRDaGV2cm9ucygpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZXRHcmlkQ29sdW1ucygpO1xuICAgICAgICAgICAgICAgIHJlc2V0Q29sbGFwc2libGVzKCk7XG4gICAgICAgICAgICAgICAgcmVzZXRIaWRkZW5Db2x1bW5zKCk7XG4gICAgICAgICAgICAgICAgcmVzZXRDaGV2cm9ucygpO1xuICAgICAgICAgICAgICAgIHJlbmRlckVsZW1lbnRzKCk7XG4gICAgICAgICAgICAgICAgaGVhZGVycy5mb3JFYWNoKGhlYWRlciA9PiBoZWFkZXIuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIG9uU29ydCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRGV0ZWN0IGEgY2hhbmdlIGluIERhdGEgZ3JpZCAyIGFmdGVyIHRoZSBpbml0aWFsIHJlbmRlcmluZyBvZiBldmVyeXRoaW5nXG4gICAgICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgaWYgKGRhdGFncmlkUm93c1JlZi5jdXJyZW50ICE9PSBkYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudHJbcm9sZT1yb3ddXCIpKSB7XG4gICAgICAgICAgICAgICAgZGF0YWdyaWRSb3dzUmVmLmN1cnJlbnQgPSBbLi4uZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnRyW3JvbGU9cm93XVwiKV07XG4gICAgICAgICAgICAgICAgaWYgKHNjcmVlbk1vZGUgIT09IFwiZGVza3RvcFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc2V0Q29sbGFwc2libGVzKCk7XG4gICAgICAgICAgICAgICAgICAgIHJlc2V0SGlkZGVuQ29sdW1ucygpO1xuICAgICAgICAgICAgICAgICAgICByZXNldENoZXZyb25zKCk7XG4gICAgICAgICAgICAgICAgICAgIHJlbmRlckVsZW1lbnRzKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQsIGNvbmZpZyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChkYXRhZ3JpZFdpZGdldFJlZiAmJiBkYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQsIGNvbmZpZyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKCkgPT4gb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgIH0pO1xuXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigoKSA9PiB7XG4gICAgICAgICAgICBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICBpZiAoZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudCkge1xuICAgICAgICAgICAgICAgIHNldFRhYmxlQ29udGVudChkYXRhZ3JpZFdpZGdldFJlZi5jdXJyZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2lkZ2V0LWRhdGFncmlkIC53aWRnZXQtZGF0YWdyaWQtZ3JpZC1ib2R5XCIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9ic2VydmVyLm9ic2VydmUoZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudCwgY29uZmlnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGRhdGFncmlkV2lkZ2V0UmVmICYmIGRhdGFncmlkV2lkZ2V0UmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIG9ic2VydmVyLm9ic2VydmUoZGF0YWdyaWRXaWRnZXRSZWYuY3VycmVudCwgY29uZmlnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoKSA9PiBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgfSk7XG5cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBpZiAodGFibGVDb250ZW50KSB7XG4gICAgICAgICAgICBzZXRUZW1wbGF0ZUNvbHVtbnModGFibGVDb250ZW50LmdldEF0dHJpYnV0ZShcInN0eWxlXCIpKTtcbiAgICAgICAgICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA8PSBtb2JpbGVCcmVha3BvaW50KSB7XG4gICAgICAgICAgICAgICAgc2V0U2NlZW5Nb2RlKFwibW9iaWxlXCIpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA+IG1vYmlsZUJyZWFrcG9pbnQgJiYgd2luZG93LmlubmVyV2lkdGggPCBkZXNrdG9wQnJlYWtwb2ludCkge1xuICAgICAgICAgICAgICAgIHNldFNjZWVuTW9kZShcInRhYmxldFwiKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAod2luZG93LmlubmVyV2lkdGggPj0gZGVza3RvcEJyZWFrcG9pbnQpIHtcbiAgICAgICAgICAgICAgICBzZXRTY2Vlbk1vZGUoXCJkZXNrdG9wXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2V0Q2FuUmVuZGVyKHRydWUpO1xuICAgICAgICB9XG4gICAgfSwgW2Rlc2t0b3BCcmVha3BvaW50LCBtb2JpbGVCcmVha3BvaW50LCB0YWJsZUNvbnRlbnRdKTtcblxuICAgIGlmIChjYW5SZW5kZXIpIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgc2NyZWVuU2l6ZUNoZWNrKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YHJlc3BvbnNpdmUtZGF0YWdyaWQgJHtzdHlsZX1gfSByZWY9e2RhdGFncmlkV2lkZ2V0UmVmfT5cbiAgICAgICAgICAgIHtkYXRhR3JpZFdpZGdldH1cbiAgICAgICAgPC9kaXY+XG4gICAgKTtcbn1cbiJdLCJuYW1lcyI6WyJSZXNwb25zaXZlRGF0YWdyaWRUd28iLCJkYXRhR3JpZFdpZGdldCIsImRlc2t0b3BCcmVha3BvaW50Iiwia2VlcExhc3RCb29sZWFuIiwibWF4Q29sdW1uc01vYmlsZSIsIm1heENvbHVtbnNUYWJsZXQiLCJmb3JjZUF1dG9GaWxsIiwibW9iaWxlQnJlYWtwb2ludCIsIlJlbmRlckNoZXZyb24iLCJyZXN0Iiwic3R5bGUiLCJjbGFzcyIsImRhdGFncmlkV2lkZ2V0UmVmIiwidXNlUmVmIiwiZGF0YWdyaWRSb3dzUmVmIiwidGFibGVDb250ZW50Iiwic2V0VGFibGVDb250ZW50IiwidXNlU3RhdGUiLCJjYW5SZW5kZXIiLCJzZXRDYW5SZW5kZXIiLCJ0ZW1wbGF0ZUNvbHVtbnMiLCJzZXRUZW1wbGF0ZUNvbHVtbnMiLCJzY3JlZW5Nb2RlIiwic2V0U2NlZW5Nb2RlIiwiY29uZmlnIiwiY2hpbGRMaXN0Iiwic3VidHJlZSIsInNjcmVlblNpemVDaGVjayIsIndpbmRvdyIsImlubmVyV2lkdGgiLCJ1c2VFZmZlY3QiLCJzZXRHcmlkQ29sdW1ucyIsImNvbHVtbkFycmF5IiwicmVwbGFjZSIsInNwbGl0IiwidmlzaWJsZUNvbHVtbnMiLCJtYXhDb2x1bW5BcnJheSIsInNsaWNlIiwibGVuZ3RoIiwicHVzaCIsImpvaW4iLCJ1bnNoaWZ0Iiwic3BsaWNlIiwic2V0QXR0cmlidXRlIiwidG9nZ2xlVHJDb2xsYXBzZSIsImV2ZW50IiwiY2hldnJvbkJ0biIsIm5vdENvbGxhcHNlZCIsImRvY3VtZW50IiwicXVlcnlTZWxlY3RvckFsbCIsImZvckVhY2giLCJjaGV2cm9uUm93Iiwicm93QnRuIiwicGFyZW50RWxlbWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJjbGFzc0xpc3QiLCJ0b2dnbGUiLCJ0YXJnZXQiLCJjbG9zZXN0IiwicmVuZGVyQ2hldnJvbiIsInJvdyIsInNlbGVjdFRIIiwiZXh0cmFUSCIsImluc2VydEFkamFjZW50SFRNTCIsInNlbGVjdFREIiwiYm9yZGVyQ2xhc3MiLCJleHRyYVREIiwicmVuZGVyQ29sbGFwc2libGVEaXYiLCJjb2xsYXBzaWJsZURpdiIsIm1vdmVDb2x1bW5zSW5zaWRlQ29sbGFwc2libGVEaXYiLCJlbmRJbmRleCIsIlRIcyIsInN0YXJ0SW5kZXgiLCJUSCIsImFkZCIsIlREcyIsIlREIiwiaW5kZXgiLCJoZWFkZXJzIiwiY3VycmVudCIsImNvbGxhcHNpYmxlIiwiY29sbGFwc2libGVDb250ZW50IiwiaW5uZXJIVE1MIiwicmVuZGVyRWxlbWVudHMiLCJjaGV2cm9uQnRucyIsImFkZEV2ZW50TGlzdGVuZXIiLCJyZXNldENvbGxhcHNpYmxlcyIsImFsbENvbGxhcHNpYmxlcyIsInJlbW92ZSIsInJlc2V0SGlkZGVuQ29sdW1ucyIsImhpZGRlbkNvbHVtbnMiLCJoaWRkZW5Db2x1bW4iLCJyZXNldENoZXZyb25zIiwicm93cyIsIm9uU29ydCIsInNldFRpbWVvdXQiLCJoZWFkZXIiLCJvYnNlcnZlciIsIk11dGF0aW9uT2JzZXJ2ZXIiLCJkaXNjb25uZWN0Iiwib2JzZXJ2ZSIsImdldEF0dHJpYnV0ZSIsImNyZWF0ZUVsZW1lbnQiLCJjbGFzc05hbWUiLCJyZWYiXSwibWFwcGluZ3MiOiI7O0lBR08sU0FBU0EscUJBQXFCQSxDQUFDO01BQ2xDQyxjQUFjO01BQ2RDLGlCQUFpQjtNQUNqQkMsZUFBZTtNQUNmQyxnQkFBZ0I7TUFDaEJDLGdCQUFnQjtNQUNoQkMsYUFBYTtNQUNiQyxnQkFBZ0I7TUFDaEJDLGFBQWE7TUFDYixHQUFHQyxJQUFBQTtJQUNQLENBQUMsRUFBRTtJQUNDLEVBQUEsTUFBTUMsS0FBSyxHQUFHRCxJQUFJLENBQUNFLEtBQUssSUFBSSxFQUFFLENBQUE7SUFDOUIsRUFBQSxNQUFNQyxpQkFBaUIsR0FBR0MsWUFBTSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ3RDLEVBQUEsTUFBTUMsZUFBZSxHQUFHRCxZQUFNLENBQUMsRUFBRSxDQUFDLENBQUE7TUFDbEMsTUFBTSxDQUFDRSxZQUFZLEVBQUVDLGVBQWUsQ0FBQyxHQUFHQyxjQUFRLENBQUMsSUFBSSxDQUFDLENBQUE7TUFDdEQsTUFBTSxDQUFDQyxTQUFTLEVBQUVDLFlBQVksQ0FBQyxHQUFHRixjQUFRLENBQUMsS0FBSyxDQUFDLENBQUE7TUFDakQsTUFBTSxDQUFDRyxlQUFlLEVBQUVDLGtCQUFrQixDQUFDLEdBQUdKLGNBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtNQUM1RCxNQUFNLENBQUNLLFVBQVUsRUFBRUMsWUFBWSxDQUFDLEdBQUdOLGNBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUNqRCxFQUFBLE1BQU1PLE1BQU0sR0FBRztJQUNYO0lBQ0E7SUFDQUMsSUFBQUEsU0FBUyxFQUFFLElBQUk7SUFBRTtRQUNqQkMsT0FBTyxFQUFFLElBQUk7T0FDaEIsQ0FBQTtNQUVELFNBQVNDLGVBQWVBLEdBQUc7SUFDdkIsSUFBQSxJQUFJQyxNQUFNLENBQUNDLFVBQVUsSUFBSXRCLGdCQUFnQixFQUFFO1VBQ3ZDLElBQUllLFVBQVUsS0FBSyxRQUFRLEVBQUU7WUFDekJDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUMxQixPQUFBO0lBQ0osS0FBQyxNQUFNLElBQUlLLE1BQU0sQ0FBQ0MsVUFBVSxHQUFHdEIsZ0JBQWdCLElBQUlxQixNQUFNLENBQUNDLFVBQVUsR0FBRzNCLGlCQUFpQixFQUFFO1VBQ3RGLElBQUlvQixVQUFVLEtBQUssUUFBUSxFQUFFO1lBQ3pCQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDMUIsT0FBQTtJQUNKLEtBQUMsTUFBTSxJQUFJSyxNQUFNLENBQUNDLFVBQVUsSUFBSTNCLGlCQUFpQixFQUFFO1VBQy9DLElBQUlvQixVQUFVLEtBQUssU0FBUyxFQUFFO1lBQzFCQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUE7SUFDM0IsT0FBQTtJQUNKLEtBQUE7SUFDSixHQUFBO0lBRUFPLEVBQUFBLGVBQVMsQ0FBQyxNQUFNO1FBQ1osU0FBU0MsY0FBY0EsR0FBRztJQUN0QixNQUFBLE1BQU1DLFdBQVcsR0FBR1osZUFBZSxDQUFDYSxPQUFPLENBQUMseUJBQXlCLEVBQUUsRUFBRSxDQUFDLENBQUNDLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQTtVQUNqRyxNQUFNQyxjQUFjLEdBQUdiLFVBQVUsS0FBSyxRQUFRLEdBQUdsQixnQkFBZ0IsR0FBR0MsZ0JBQWdCLENBQUE7VUFDcEYsTUFBTStCLGNBQWMsR0FBR0osV0FBVyxDQUFDSyxLQUFLLENBQ3BDLENBQUMsRUFDREwsV0FBVyxDQUFDTSxNQUFNLElBQUlOLFdBQVcsQ0FBQ00sTUFBTSxHQUFHSCxjQUFjLENBQUMsSUFBSWhDLGVBQWUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQzFGLENBQUMsQ0FBQTtJQUVELE1BQUEsSUFBSUEsZUFBZSxFQUFFO0lBQ2pCaUMsUUFBQUEsY0FBYyxDQUFDRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtJQUM1QyxPQUFBO1VBQ0FILGNBQWMsQ0FBQ0ksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDUCxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFBO1VBRXpDLElBQUl6QixhQUFhLEtBQUssT0FBTyxFQUFFO0lBQzNCNEIsUUFBQUEsY0FBYyxDQUFDRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtJQUM1QyxPQUFDLE1BQU07SUFDSEgsUUFBQUEsY0FBYyxDQUFDSyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtJQUMvQyxPQUFBO0lBRUEsTUFBQSxJQUFJbkMsYUFBYSxFQUFFO1lBQ2Y4QixjQUFjLENBQUNNLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFBO0lBQ3RDLE9BQUE7VUFFQTNCLFlBQVksQ0FBQzRCLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBMEJQLHVCQUFBQSxFQUFBQSxjQUFjLENBQUNJLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQ1AsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDOUcsS0FBQTtJQUVBLElBQUEsU0FBU1csZ0JBQWdCQSxDQUFDQyxLQUFLLEVBQUVDLFVBQVUsRUFBRTtVQUN6QyxNQUFNQyxZQUFZLEdBQUcsQ0FDakIsR0FBR0MsUUFBUSxDQUFDQyxnQkFBZ0IsQ0FBQywyREFBMkQsQ0FBQyxDQUM1RixDQUFBO1VBQ0QsSUFBSUYsWUFBWSxDQUFDVCxNQUFNLEVBQUU7SUFDckJTLFFBQUFBLFlBQVksQ0FBQ0csT0FBTyxDQUFDQyxVQUFVLElBQUk7Y0FDL0IsTUFBTUMsTUFBTSxHQUFHRCxVQUFVLENBQUNFLGFBQWEsQ0FBQ0MsYUFBYSxDQUFDLHVCQUF1QixDQUFDLENBQUE7Y0FDOUUsSUFBSUYsTUFBTSxLQUFLTixVQUFVLEVBQUU7SUFDdkJLLFlBQUFBLFVBQVUsQ0FBQ0ksU0FBUyxDQUFDQyxNQUFNLENBQUMsZ0NBQWdDLENBQUMsQ0FBQTtJQUM3REwsWUFBQUEsVUFBVSxDQUFDRSxhQUFhLENBQ25CQyxhQUFhLENBQUMsdUJBQXVCLENBQUMsQ0FDdENDLFNBQVMsQ0FBQ0MsTUFBTSxDQUFDLDhCQUE4QixDQUFDLENBQUE7SUFDekQsV0FBQTtJQUNKLFNBQUMsQ0FBQyxDQUFBO0lBQ04sT0FBQTtJQUVBVixNQUFBQSxVQUFVLENBQUNTLFNBQVMsQ0FBQ0MsTUFBTSxDQUFDLDhCQUE4QixDQUFDLENBQUE7SUFDM0RYLE1BQUFBLEtBQUssQ0FBQ1ksTUFBTSxDQUNQQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQ2RKLGFBQWEsQ0FBQyxzQkFBc0IsQ0FBQyxDQUNyQ0MsU0FBUyxDQUFDQyxNQUFNLENBQUMsZ0NBQWdDLENBQUMsQ0FBQTtJQUMzRCxLQUFBOztJQUVBO1FBQ0EsU0FBU0csYUFBYUEsQ0FBQ0MsR0FBRyxFQUFFO1VBQ3hCLE1BQU16QixjQUFjLEdBQUdiLFVBQVUsS0FBSyxRQUFRLEdBQUdsQixnQkFBZ0IsR0FBR0MsZ0JBQWdCLENBQUE7SUFDcEY7SUFDQSxNQUFBLElBQUksQ0FBQ3VELEdBQUcsQ0FBQ04sYUFBYSxDQUFDLGdCQUFnQixDQUFDLEVBQUU7WUFDdEMsTUFBTU8sUUFBUSxHQUNWckQsYUFBYSxLQUFLLE1BQU0sR0FDbEJvRCxHQUFHLENBQUNOLGFBQWEsQ0FBQyxLQUFLLENBQUMsR0FDeEJNLEdBQUcsQ0FBQ04sYUFBYSxDQUFDLGlCQUFpQm5CLGNBQWMsR0FBRyxDQUFDLENBQUEsQ0FBQSxDQUFHLENBQUMsQ0FBQTtZQUNuRSxNQUFNMkIsT0FBTyxHQUFHLENBQWlHLCtGQUFBLENBQUEsQ0FBQTtJQUNqSCxRQUFBLElBQUlELFFBQVEsSUFBSUEsUUFBUSxDQUFDUCxhQUFhLENBQUMsb0JBQW9CLENBQUMsSUFBSTlDLGFBQWEsS0FBSyxNQUFNLEVBQUU7SUFDdEZxRCxVQUFBQSxRQUFRLENBQUNFLGtCQUFrQixDQUFDLFVBQVUsRUFBRUQsT0FBTyxDQUFDLENBQUE7YUFDbkQsTUFBTSxJQUFJRCxRQUFRLEVBQUU7SUFDakJBLFVBQUFBLFFBQVEsQ0FBQ0Usa0JBQWtCLENBQUMsYUFBYSxFQUFFRCxPQUFPLENBQUMsQ0FBQTtJQUN2RCxTQUFBO0lBQ0osT0FBQTs7SUFFQTtJQUNBLE1BQUEsSUFBSSxDQUFDRixHQUFHLENBQUNOLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO1lBQ3RDLE1BQU1VLFFBQVEsR0FDVnhELGFBQWEsS0FBSyxNQUFNLEdBQ2xCb0QsR0FBRyxDQUFDTixhQUFhLENBQUMsS0FBSyxDQUFDLEdBQ3hCTSxHQUFHLENBQUNOLGFBQWEsQ0FBQyxpQkFBaUJuQixjQUFjLEdBQUcsQ0FBQyxDQUFBLENBQUEsQ0FBRyxDQUFDLENBQUE7WUFDbkUsTUFBTThCLFdBQVcsR0FBR0wsR0FBRyxDQUFDTixhQUFhLENBQUMsYUFBYSxDQUFDLEdBQUcsYUFBYSxHQUFHLEVBQUUsQ0FBQTtJQUN6RSxRQUFBLE1BQU1ZLE9BQU8sR0FBRyxDQUFrQkQsZUFBQUEsRUFBQUEsV0FBVyxDQUFzcUIsb3FCQUFBLENBQUEsQ0FBQTtJQUNudEIsUUFBQSxJQUFJRCxRQUFRLElBQUlBLFFBQVEsQ0FBQ1YsYUFBYSxDQUFDLG9CQUFvQixDQUFDLElBQUk5QyxhQUFhLEtBQUssTUFBTSxFQUFFO0lBQ3RGd0QsVUFBQUEsUUFBUSxDQUFDRCxrQkFBa0IsQ0FBQyxVQUFVLEVBQUVHLE9BQU8sQ0FBQyxDQUFBO2FBQ25ELE1BQU0sSUFBSUYsUUFBUSxFQUFFO0lBQ2pCQSxVQUFBQSxRQUFRLENBQUNELGtCQUFrQixDQUFDLGFBQWEsRUFBRUcsT0FBTyxDQUFDLENBQUE7SUFDdkQsU0FBQTtJQUNKLE9BQUE7SUFDSixLQUFBO1FBRUEsU0FBU0Msb0JBQW9CQSxDQUFDUCxHQUFHLEVBQUU7VUFDL0IsTUFBTVEsY0FBYyxHQUFHLENBQXdFLHNFQUFBLENBQUEsQ0FBQTtJQUMvRixNQUFBLElBQUksQ0FBQ1IsR0FBRyxDQUFDTixhQUFhLENBQUMsc0JBQXNCLENBQUMsRUFBRTtJQUM1Q00sUUFBQUEsR0FBRyxDQUFDRyxrQkFBa0IsQ0FBQyxXQUFXLEVBQUVLLGNBQWMsQ0FBQyxDQUFBO0lBQ3ZELE9BQUE7SUFDSixLQUFBO1FBRUEsU0FBU0MsK0JBQStCQSxDQUFDVCxHQUFHLEVBQUU7VUFDMUMsTUFBTXpCLGNBQWMsR0FBR2IsVUFBVSxLQUFLLFFBQVEsR0FBR2xCLGdCQUFnQixHQUFHQyxnQkFBZ0IsQ0FBQTtJQUNwRixNQUFBLE1BQU1pRSxRQUFRLEdBQUduRSxlQUFlLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1VBQ3pDLE1BQU1vRSxHQUFHLEdBQUcsQ0FBQyxHQUFHWCxHQUFHLENBQUNYLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7VUFFNUMsSUFBSXNCLEdBQUcsQ0FBQ2pDLE1BQU0sRUFBRTtJQUNaLFFBQUEsTUFBTWtDLFVBQVUsR0FBR0QsR0FBRyxDQUFDakMsTUFBTSxJQUFJaUMsR0FBRyxDQUFDakMsTUFBTSxHQUFHSCxjQUFjLENBQUMsSUFBSWhDLGVBQWUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUUxRixRQUFBLElBQUlBLGVBQWUsRUFBRTtjQUNqQm9FLEdBQUcsQ0FBQ2xDLEtBQUssQ0FBQ21DLFVBQVUsRUFBRUYsUUFBUSxDQUFDLENBQUNwQixPQUFPLENBQUN1QixFQUFFLElBQUk7SUFDMUNBLFlBQUFBLEVBQUUsQ0FBQ2xCLFNBQVMsQ0FBQ21CLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUM5QixXQUFDLENBQUMsQ0FBQTtJQUNOLFNBQUMsTUFBTTtjQUNISCxHQUFHLENBQUNsQyxLQUFLLENBQUNtQyxVQUFVLENBQUMsQ0FBQ3RCLE9BQU8sQ0FBQ3VCLEVBQUUsSUFBSTtJQUNoQ0EsWUFBQUEsRUFBRSxDQUFDbEIsU0FBUyxDQUFDbUIsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQzlCLFdBQUMsQ0FBQyxDQUFBO0lBQ04sU0FBQTtJQUNKLE9BQUE7VUFFQSxNQUFNQyxHQUFHLEdBQUcsQ0FBQyxHQUFHZixHQUFHLENBQUNYLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7VUFDNUMsSUFBSTBCLEdBQUcsQ0FBQ3JDLE1BQU0sRUFBRTtJQUNaLFFBQUEsTUFBTWtDLFVBQVUsR0FBR0csR0FBRyxDQUFDckMsTUFBTSxJQUFJcUMsR0FBRyxDQUFDckMsTUFBTSxHQUFHSCxjQUFjLENBQUMsSUFBSWhDLGVBQWUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUUxRixRQUFBLElBQUlBLGVBQWUsRUFBRTtJQUNqQndFLFVBQUFBLEdBQUcsQ0FBQ3RDLEtBQUssQ0FBQ21DLFVBQVUsRUFBRUYsUUFBUSxDQUFDLENBQUNwQixPQUFPLENBQUMsQ0FBQzBCLEVBQUUsRUFBRUMsS0FBSyxLQUFLO0lBQ25ERCxZQUFBQSxFQUFFLENBQUNyQixTQUFTLENBQUNtQixHQUFHLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDMUIsWUFBQSxNQUFNSSxPQUFPLEdBQUcsQ0FDWixHQUFHbEUsaUJBQWlCLENBQUNtRSxPQUFPLENBQUM5QixnQkFBZ0IsQ0FDekMseURBQ0osQ0FBQyxDQUNKLENBQUE7SUFDRCxZQUFBLE1BQU0rQixXQUFXLEdBQUdwQixHQUFHLENBQUNOLGFBQWEsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFBO0lBQzdELFlBQUEsTUFBTTJCLGtCQUFrQixHQUFHLENBQUE7QUFDbkQsa0VBQW9FSCxFQUFBQSxPQUFPLENBQUNELEtBQUssQ0FBQyxFQUFFdkIsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDNEIsU0FBUyxDQUFBO0FBQ25ILHNEQUFBLEVBQXdETixFQUFFLENBQUN0QixhQUFhLENBQUMsTUFBTSxDQUFDLEVBQUU0QixTQUFTLENBQUE7QUFDM0Ysa0NBQW1DLENBQUEsQ0FBQTtJQUNYRixZQUFBQSxXQUFXLENBQUNqQixrQkFBa0IsQ0FBQyxXQUFXLEVBQUVrQixrQkFBa0IsQ0FBQyxDQUFBO0lBQ25FLFdBQUMsQ0FBQyxDQUFBO0lBQ04sU0FBQyxNQUFNO0lBQ0hOLFVBQUFBLEdBQUcsQ0FBQ3RDLEtBQUssQ0FBQ21DLFVBQVUsQ0FBQyxDQUFDdEIsT0FBTyxDQUFDLENBQUMwQixFQUFFLEVBQUVDLEtBQUssS0FBSztJQUN6Q0QsWUFBQUEsRUFBRSxDQUFDckIsU0FBUyxDQUFDbUIsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQzFCLFlBQUEsTUFBTUksT0FBTyxHQUFHLENBQ1osR0FBR2xFLGlCQUFpQixDQUFDbUUsT0FBTyxDQUFDOUIsZ0JBQWdCLENBQ3pDLHlEQUNKLENBQUMsQ0FDSixDQUFBO0lBQ0QsWUFBQSxNQUFNK0IsV0FBVyxHQUFHcEIsR0FBRyxDQUFDTixhQUFhLENBQUMsc0JBQXNCLENBQUMsQ0FBQTtJQUM3RCxZQUFBLE1BQU0yQixrQkFBa0IsR0FBRyxDQUFBO0FBQ25ELDhEQUFnRUgsRUFBQUEsT0FBTyxDQUFDRCxLQUFLLENBQUMsRUFBRXZCLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQzRCLFNBQVMsQ0FBQTtBQUMvRyxrREFBQSxFQUFvRE4sRUFBRSxDQUFDdEIsYUFBYSxDQUFDLE1BQU0sQ0FBQyxFQUFFNEIsU0FBUyxDQUFBO0FBQ3ZGLDhCQUErQixDQUFBLENBQUE7SUFDUEYsWUFBQUEsV0FBVyxDQUFDakIsa0JBQWtCLENBQUMsV0FBVyxFQUFFa0Isa0JBQWtCLENBQUMsQ0FBQTtJQUNuRSxXQUFDLENBQUMsQ0FBQTtJQUNOLFNBQUE7SUFDSixPQUFBO0lBQ0osS0FBQTtRQUVBLFNBQVNFLGNBQWNBLEdBQUc7SUFDdEI7SUFDQXJFLE1BQUFBLGVBQWUsQ0FBQ2lFLE9BQU8sQ0FBQzdCLE9BQU8sQ0FBQ1UsR0FBRyxJQUFJO1lBQ25DTyxvQkFBb0IsQ0FBQ1AsR0FBRyxDQUFDLENBQUE7WUFDekJTLCtCQUErQixDQUFDVCxHQUFHLENBQUMsQ0FBQTtZQUNwQ0QsYUFBYSxDQUFDQyxHQUFHLENBQUMsQ0FBQTtJQUN0QixPQUFDLENBQUMsQ0FBQTtJQUVGLE1BQUEsTUFBTXdCLFdBQVcsR0FBRyxDQUFDLEdBQUd4RSxpQkFBaUIsQ0FBQ21FLE9BQU8sQ0FBQzlCLGdCQUFnQixDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQTtVQUM1Rm1DLFdBQVcsQ0FBQ2xDLE9BQU8sQ0FBQ0osVUFBVSxJQUMxQkEsVUFBVSxDQUFDdUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFeEMsS0FBSyxJQUFJRCxnQkFBZ0IsQ0FBQ0MsS0FBSyxFQUFFQyxVQUFVLENBQUMsQ0FDckYsQ0FBQyxDQUFBO0lBQ0wsS0FBQTtRQUVBLFNBQVN3QyxpQkFBaUJBLEdBQUc7SUFDekIsTUFBQSxNQUFNQyxlQUFlLEdBQUcsQ0FBQyxHQUFHM0UsaUJBQWlCLENBQUNtRSxPQUFPLENBQUM5QixnQkFBZ0IsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUE7VUFDL0ZzQyxlQUFlLENBQUNyQyxPQUFPLENBQUM4QixXQUFXLElBQUlBLFdBQVcsQ0FBQ1EsTUFBTSxFQUFFLENBQUMsQ0FBQTtJQUNoRSxLQUFBO1FBRUEsU0FBU0Msa0JBQWtCQSxHQUFHO0lBQzFCLE1BQUEsTUFBTUMsYUFBYSxHQUFHLENBQUMsR0FBRzlFLGlCQUFpQixDQUFDbUUsT0FBTyxDQUFDOUIsZ0JBQWdCLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFBO0lBQy9GeUMsTUFBQUEsYUFBYSxDQUFDeEMsT0FBTyxDQUFDeUMsWUFBWSxJQUFJQSxZQUFZLENBQUNwQyxTQUFTLENBQUNpQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQTtJQUNsRixLQUFBO1FBRUEsU0FBU0ksYUFBYUEsR0FBRztJQUNyQixNQUFBLE1BQU1DLElBQUksR0FBRyxDQUFDLEdBQUdqRixpQkFBaUIsQ0FBQ21FLE9BQU8sQ0FBQzlCLGdCQUFnQixDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQTtJQUMvRTRDLE1BQUFBLElBQUksQ0FBQzNDLE9BQU8sQ0FBQ1UsR0FBRyxJQUFJO1lBQ2hCQSxHQUFHLENBQUNOLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFa0MsTUFBTSxFQUFFLENBQUE7WUFDN0M1QixHQUFHLENBQUNOLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFa0MsTUFBTSxFQUFFLENBQUE7SUFDakQsT0FBQyxDQUFDLENBQUE7SUFDTixLQUFBO1FBRUEsU0FBU00sTUFBTUEsR0FBRztJQUNkLE1BQUEsSUFDSWxFLE1BQU0sQ0FBQ0MsVUFBVSxJQUFJdEIsZ0JBQWdCLElBQ3BDcUIsTUFBTSxDQUFDQyxVQUFVLEdBQUd0QixnQkFBZ0IsSUFBSXFCLE1BQU0sQ0FBQ0MsVUFBVSxHQUFHM0IsaUJBQWtCLEVBQ2pGO0lBQ0U2RixRQUFBQSxVQUFVLENBQUMsTUFBTTtJQUNiVCxVQUFBQSxpQkFBaUIsRUFBRSxDQUFBO0lBQ25CRyxVQUFBQSxrQkFBa0IsRUFBRSxDQUFBO0lBQ3BCRyxVQUFBQSxhQUFhLEVBQUUsQ0FBQTtJQUNmVCxVQUFBQSxjQUFjLEVBQUUsQ0FBQTthQUNuQixFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ1gsT0FBQTtJQUNKLEtBQUE7UUFFQSxJQUFJakUsU0FBUyxJQUFJSSxVQUFVLEVBQUU7SUFDekIsTUFBQSxNQUFNd0QsT0FBTyxHQUFHLENBQUMsR0FBR2hFLGVBQWUsQ0FBQ2lFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQzlCLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7O0lBRXZFO1VBQ0EsSUFBSTNCLFVBQVUsS0FBSyxTQUFTLEVBQUU7SUFDMUJQLFFBQUFBLFlBQVksQ0FBQzRCLFlBQVksQ0FBQyxPQUFPLEVBQUV2QixlQUFlLENBQUMsQ0FBQTtJQUNuRGtFLFFBQUFBLGlCQUFpQixFQUFFLENBQUE7SUFDbkJHLFFBQUFBLGtCQUFrQixFQUFFLENBQUE7SUFDcEJHLFFBQUFBLGFBQWEsRUFBRSxDQUFBO0lBQ25CLE9BQUMsTUFBTTtJQUNIN0QsUUFBQUEsY0FBYyxFQUFFLENBQUE7SUFDaEJ1RCxRQUFBQSxpQkFBaUIsRUFBRSxDQUFBO0lBQ25CRyxRQUFBQSxrQkFBa0IsRUFBRSxDQUFBO0lBQ3BCRyxRQUFBQSxhQUFhLEVBQUUsQ0FBQTtJQUNmVCxRQUFBQSxjQUFjLEVBQUUsQ0FBQTtJQUNoQkwsUUFBQUEsT0FBTyxDQUFDNUIsT0FBTyxDQUFDOEMsTUFBTSxJQUFJQSxNQUFNLENBQUNYLGdCQUFnQixDQUFDLE9BQU8sRUFBRVMsTUFBTSxDQUFDLENBQUMsQ0FBQTtJQUN2RSxPQUFBO0lBQ0osS0FBQTs7SUFFQTtJQUNBLElBQUEsTUFBTUcsUUFBUSxHQUFHLElBQUlDLGdCQUFnQixDQUFDLE1BQU07VUFDeENELFFBQVEsQ0FBQ0UsVUFBVSxFQUFFLENBQUE7SUFDckIsTUFBQSxJQUFJckYsZUFBZSxDQUFDaUUsT0FBTyxLQUFLbkUsaUJBQWlCLENBQUNtRSxPQUFPLENBQUM5QixnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsRUFBRTtJQUN6Rm5DLFFBQUFBLGVBQWUsQ0FBQ2lFLE9BQU8sR0FBRyxDQUFDLEdBQUduRSxpQkFBaUIsQ0FBQ21FLE9BQU8sQ0FBQzlCLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUE7WUFDMUYsSUFBSTNCLFVBQVUsS0FBSyxTQUFTLEVBQUU7SUFDMUJnRSxVQUFBQSxpQkFBaUIsRUFBRSxDQUFBO0lBQ25CRyxVQUFBQSxrQkFBa0IsRUFBRSxDQUFBO0lBQ3BCRyxVQUFBQSxhQUFhLEVBQUUsQ0FBQTtJQUNmVCxVQUFBQSxjQUFjLEVBQUUsQ0FBQTtJQUNwQixTQUFBO0lBQ0osT0FBQTtVQUVBYyxRQUFRLENBQUNHLE9BQU8sQ0FBQ3hGLGlCQUFpQixDQUFDbUUsT0FBTyxFQUFFdkQsTUFBTSxDQUFDLENBQUE7SUFDdkQsS0FBQyxDQUFDLENBQUE7SUFFRixJQUFBLElBQUlaLGlCQUFpQixJQUFJQSxpQkFBaUIsQ0FBQ21FLE9BQU8sRUFBRTtVQUNoRGtCLFFBQVEsQ0FBQ0csT0FBTyxDQUFDeEYsaUJBQWlCLENBQUNtRSxPQUFPLEVBQUV2RCxNQUFNLENBQUMsQ0FBQTtJQUN2RCxLQUFBO0lBRUEsSUFBQSxPQUFPLE1BQU15RSxRQUFRLENBQUNFLFVBQVUsRUFBRSxDQUFBO0lBQ3RDLEdBQUMsQ0FBQyxDQUFBO0lBRUZyRSxFQUFBQSxlQUFTLENBQUMsTUFBTTtJQUNaLElBQUEsTUFBTW1FLFFBQVEsR0FBRyxJQUFJQyxnQkFBZ0IsQ0FBQyxNQUFNO1VBQ3hDRCxRQUFRLENBQUNFLFVBQVUsRUFBRSxDQUFBO1VBQ3JCLElBQUl2RixpQkFBaUIsQ0FBQ21FLE9BQU8sRUFBRTtZQUMzQi9ELGVBQWUsQ0FBQ0osaUJBQWlCLENBQUNtRSxPQUFPLENBQUN6QixhQUFhLENBQUMsNkNBQTZDLENBQUMsQ0FBQyxDQUFBO0lBQzNHLE9BQUE7VUFDQTJDLFFBQVEsQ0FBQ0csT0FBTyxDQUFDeEYsaUJBQWlCLENBQUNtRSxPQUFPLEVBQUV2RCxNQUFNLENBQUMsQ0FBQTtJQUN2RCxLQUFDLENBQUMsQ0FBQTtJQUVGLElBQUEsSUFBSVosaUJBQWlCLElBQUlBLGlCQUFpQixDQUFDbUUsT0FBTyxFQUFFO1VBQ2hEa0IsUUFBUSxDQUFDRyxPQUFPLENBQUN4RixpQkFBaUIsQ0FBQ21FLE9BQU8sRUFBRXZELE1BQU0sQ0FBQyxDQUFBO0lBQ3ZELEtBQUE7SUFFQSxJQUFBLE9BQU8sTUFBTXlFLFFBQVEsQ0FBQ0UsVUFBVSxFQUFFLENBQUE7SUFDdEMsR0FBQyxDQUFDLENBQUE7SUFFRnJFLEVBQUFBLGVBQVMsQ0FBQyxNQUFNO0lBQ1osSUFBQSxJQUFJZixZQUFZLEVBQUU7SUFDZE0sTUFBQUEsa0JBQWtCLENBQUNOLFlBQVksQ0FBQ3NGLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFBO0lBQ3RELE1BQUEsSUFBSXpFLE1BQU0sQ0FBQ0MsVUFBVSxJQUFJdEIsZ0JBQWdCLEVBQUU7WUFDdkNnQixZQUFZLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDMUIsT0FBQyxNQUFNLElBQUlLLE1BQU0sQ0FBQ0MsVUFBVSxHQUFHdEIsZ0JBQWdCLElBQUlxQixNQUFNLENBQUNDLFVBQVUsR0FBRzNCLGlCQUFpQixFQUFFO1lBQ3RGcUIsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQzFCLE9BQUMsTUFBTSxJQUFJSyxNQUFNLENBQUNDLFVBQVUsSUFBSTNCLGlCQUFpQixFQUFFO1lBQy9DcUIsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFBO0lBQzNCLE9BQUE7VUFDQUosWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ3RCLEtBQUE7T0FDSCxFQUFFLENBQUNqQixpQkFBaUIsRUFBRUssZ0JBQWdCLEVBQUVRLFlBQVksQ0FBQyxDQUFDLENBQUE7SUFFdkQsRUFBQSxJQUFJRyxTQUFTLEVBQUU7SUFDWFUsSUFBQUEsTUFBTSxDQUFDeUQsZ0JBQWdCLENBQUMsUUFBUSxFQUFFMUQsZUFBZSxDQUFDLENBQUE7SUFDdEQsR0FBQTtJQUVBLEVBQUEsT0FDSTJFLG1CQUFBLENBQUEsS0FBQSxFQUFBO1FBQUtDLFNBQVMsRUFBRSxDQUF1QjdGLG9CQUFBQSxFQUFBQSxLQUFLLENBQUcsQ0FBQTtJQUFDOEYsSUFBQUEsR0FBRyxFQUFFNUYsaUJBQUFBO0lBQWtCLEdBQUEsRUFDbEVYLGNBQ0EsQ0FBQyxDQUFBO0lBRWQ7Ozs7Ozs7Ozs7In0=
