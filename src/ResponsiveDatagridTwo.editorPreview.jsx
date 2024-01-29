import { createElement } from "react";

export function preview() {
    return (
        <div className="responsive-datagrid-preview">
            Responsive Data grid 2 widget (does not display the data grid that is inside)
        </div>
    );
}

export function getPreviewCss() {
    return require("./ui/ResponsiveDatagridTwo.css");
}
