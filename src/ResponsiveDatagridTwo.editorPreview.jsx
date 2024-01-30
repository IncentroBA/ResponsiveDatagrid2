import { createElement } from "react";

export function preview({ dataGridWidget }) {
    const ContentRenderer = dataGridWidget.renderer;

    return (
        <div className="responsive-datagrid-preview">
            <ContentRenderer caption="Place a Datagridv2 widget inside.">
                <div className="responsive-datagrid-preview-content" />
            </ContentRenderer>
        </div>
    );
}

export function getPreviewCss() {
    return require("./ui/ResponsiveDatagridTwo.css");
}
