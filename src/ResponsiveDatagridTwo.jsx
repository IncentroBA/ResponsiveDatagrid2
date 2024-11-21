import "./ui/ResponsiveDatagridTwo.css";
import { createElement, useEffect, useRef, useState } from "react";

export function ResponsiveDatagridTwo({
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
        childList: true, // This is a must have for the observer with subtree
        subtree: true // Set to true if changes must also be observed in descendants.
    };

    function screenSizeCheck() {
        const breakpointsMap = breakpoints.reduce((map, breakpoint) => {
            map[breakpoint.for] = breakpoint;
            return map;
        }, {});
        const { mobile, tablet, desktop } = breakpointsMap;
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
        const maxColumnArray = columnArray.slice(
            0,
            columnArray.length - (columnArray.length - maxColumns) + (keepLastBoolean ? -1 : 0)
        );

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
        const notCollapsed = [
            ...document.querySelectorAll(".tr-resp-collapsible:not(.tr-resp-collapsible--collapsed)")
        ];
        if (notCollapsed.length) {
            notCollapsed.forEach(chevronRow => {
                const rowBtn = chevronRow.parentElement.querySelector(".btn-td-resp-collapse");
                if (rowBtn !== chevronBtn) {
                    chevronRow.classList.toggle("tr-resp-collapsible--collapsed");
                    chevronRow.parentElement
                        .querySelector(".btn-td-resp-collapse")
                        .classList.toggle("btn-td-resp-collapse--active");
                }
            });
        }

        chevronBtn.classList.toggle("btn-td-resp-collapse--active");
        event.target
            .closest(".tr")
            .querySelector(".tr-resp-collapsible")
            .classList.toggle("tr-resp-collapsible--collapsed");
    }

    // Check the column to insert the chevron
    function renderChevron(row) {
        // Check first TH if there is no chevron present
        if (!row.querySelector(".th.chevron-th")) {
            const selectTH =
                RenderChevron === "left"
                    ? row.querySelector(".th")
                    : row.querySelector(`.th:nth-child(${maxColumns + 1})`);
            const extraTH = `<div class="th chevron-th" role="columnheader"><div class="column-container">&nbsp;</div></div>`;
            if (selectTH && selectTH.querySelector(".td-custom-content") && RenderChevron === "left") {
                selectTH.insertAdjacentHTML("afterend", extraTH);
            } else if (selectTH) {
                selectTH.insertAdjacentHTML("beforebegin", extraTH);
            }
        }

        // Check first TD if there is no chevron present
        if (!row.querySelector(".td.chevron-td")) {
            const selectTD =
                RenderChevron === "left"
                    ? row.querySelector(".td")
                    : row.querySelector(`.td:nth-child(${maxColumns + 1})`);
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
                    const headers = [
                        ...datagridWidgetRef.current.querySelectorAll(
                            '.widget-datagrid .tr[role="row"]:first-child .th.hidden'
                        )
                    ];
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
                    const headers = [
                        ...datagridWidgetRef.current.querySelectorAll(
                            '.widget-datagrid .tr[role="row"]:first-child .th.hidden'
                        )
                    ];
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
        chevronBtns.forEach(chevronBtn =>
            chevronBtn.addEventListener("click", event => toggleTrCollapse(event, chevronBtn))
        );
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

    useEffect(() => {
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
                setTableContent(datagridWidgetRef.current.querySelector(".widget-datagrid .widget-datagrid-grid-body"));
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

    return (
        <div className={`responsive-datagrid ${style}`} ref={datagridWidgetRef}>
            {dataGridWidget}
        </div>
    );
}
