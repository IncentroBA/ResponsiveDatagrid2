import "./ui/ResponsiveDatagridTwo.css";
import { createElement, useEffect, useRef, useState } from "react";

export function ResponsiveDatagridTwo({
    dataGridWidget,
    desktopBreakpoint,
    maxColumnsMobile,
    maxColumnsTablet,
    mobileBreakpoint,
    ...rest
}) {
    const style = rest.class || "";
    const datagridWidgetRef = useRef(null);
    const [tableContent, setTableContent] = useState(null);
    const [canRender, setCanRender] = useState(false);
    const [templateColumns, setTemplateColumns] = useState(null);
    const [screenMode, setSceenMode] = useState(null);
    const config = {
        // attributes: true,
        // attributeOldValue: true,
        childList: true, // This is a must have for the observer with subtree
        subtree: true // Set to true if changes must also be observed in descendants.
    };
    const [shouldSkip, setShouldSkip] = useState(false);

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
        if (mostRightTH && mostRightTH.querySelector("span").innerHTML === "&nbsp;") {
            return true;
        } else if (mostRightTH) {
            return false;
        }

        // Check the TD for custom content
        const MostRightTD = row.querySelector(".td:last-of-type") || row.querySelector(".td:nth-last-child(2)");
        if (MostRightTD && MostRightTD.querySelector(".td-custom-content")) {
            return true;
        } else if (MostRightTD) {
            return false;
        }

        return null;
    }

    useEffect(() => {
        function toggleTrCollapse(event, chevronBtn) {
            const notCollapsed = [...document.querySelectorAll(".tr-collapsible:not(.tr-collapsible--collapsed)")];
            if (notCollapsed.length) {
                notCollapsed.forEach(chevronRow => {
                    const rowBtn = chevronRow.parentElement.querySelector(".btn-td-collapse");
                    if (rowBtn !== chevronBtn) {
                        chevronRow.classList.toggle("tr-collapsible--collapsed");
                        chevronRow.parentElement
                            .querySelector(".btn-td-collapse")
                            .classList.toggle("btn-td-collapse--active");
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
                const extraTD = `<div class="td chevron-td btn-td-collapse" role="gridcell"><div class="td-custom-content"><svg height="16" width="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M8.00004 11.1369C8.21033 11.1369 8.38741 11.0539 8.54789 10.8934L12.4935 6.85368C12.6208 6.72087 12.6872 6.56592 12.6872 6.37777C12.6872 5.9904 12.3829 5.68604 12.0066 5.68604C11.8239 5.68604 11.6469 5.76351 11.5085 5.90186L8.00557 9.50439L4.49158 5.90186C4.35876 5.76904 4.18722 5.68604 3.99353 5.68604C3.61723 5.68604 3.31287 5.9904 3.31287 6.37777C3.31287 6.56038 3.38481 6.72087 3.51208 6.85368L7.45772 10.8934C7.62374 11.0594 7.79529 11.1369 8.00004 11.1369Z"/></svg></div></div>`;
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
                THs.slice(visibleColumns, offset).forEach(TH => TH.classList.add("hidden"));
            }

            const TDs = [...row.querySelectorAll(".td")];
            if (TDs.length) {
                const newTDs = TDs.slice(visibleColumns, offset);
                newTDs.forEach((TD, index) => {
                    TD.classList.add("hidden");
                    const headers = [
                        ...datagridWidgetRef.current.querySelectorAll(
                            '.widget-datagrid .tr[role="row"]:first-child .th.hidden'
                        )
                    ];
                    const collapsible = row.querySelector(".tr-collapsible");
                    const collapsibleContent = `<div class="tr-collapsible__item">
          <p class="td-text text-bold nomargin">${headers[index]?.querySelector("span").innerHTML}</p>
          <span class="td-text">${TD.querySelector("span")?.innerHTML}</span>
        </div>`;
                    collapsible.insertAdjacentHTML("beforeend", collapsibleContent);
                });
            }
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

        if (canRender && screenMode) {
            // For desktop leave / restore default. For other situations update to mobile / tablet columns
            if (screenMode === "desktop") {
                tableContent.setAttribute("style", templateColumns);
                resetCollapsibles();
                resetHiddenColumns();
                resetChevrons();
            } else {
                const endsWithCustomContent = checkLastColumn(
                    datagridWidgetRef.current.querySelector(".widget-datagrid .tr[role='row']:nth-child(2)")
                );
                const offset = endsWithCustomContent ? -1 : 0;
                const columnArray = templateColumns.replace("grid-template-columns: ", "").split(" ");
                const visibleColumns = screenMode === "mobile" ? maxColumnsMobile : maxColumnsTablet;
                const maxColumnArray = columnArray.slice(columnArray.length - visibleColumns - offset); // remove all but the last maxColumnsMobile

                if (offset) {
                    maxColumnArray.push("fit-content(100%)");
                }
                maxColumnArray.join(" ").replace(";", "");
                maxColumnArray.unshift("fit-content(100%)"); // add new column for the chevron
                tableContent.setAttribute(
                    "style",
                    `grid-template-columns: ${maxColumnArray.join(" ").replace(";", "")};`
                );

                resetCollapsibles();
                resetHiddenColumns();
                resetChevrons();

                // Process each row
                const rows = [...datagridWidgetRef.current.querySelectorAll('.tr[role="row"]')];
                rows.forEach(row => {
                    renderChevron(row);
                    renderCollapsibleDiv(row);
                    moveColumnsInsideCollapsibleDiv(row);
                });

                const chevronBtns = [...datagridWidgetRef.current.querySelectorAll(".btn-td-collapse")];
                chevronBtns.forEach(chevronBtn =>
                    chevronBtn.addEventListener("click", event => toggleTrCollapse(event, chevronBtn))
                );
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
        if (shouldSkip === false) {
            setShouldSkip(true);
        }
        window.addEventListener("resize", screenSizeCheck);
    }

    return (
        <div className={`responsive-datagrid ${style}`} ref={datagridWidgetRef}>
            {dataGridWidget}
        </div>
    );
}
