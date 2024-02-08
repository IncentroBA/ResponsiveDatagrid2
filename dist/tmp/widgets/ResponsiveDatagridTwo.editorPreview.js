'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var react = require('react');

function getDefaultExportFromNamespaceIfNotNamed (n) {
	return n && Object.prototype.hasOwnProperty.call(n, 'default') && Object.keys(n).length === 1 ? n['default'] : n;
}

function styleInject(css, ref) {
  if (ref === void 0) ref = {};
  var insertAt = ref.insertAt;
  if (!css || typeof document === 'undefined') {
    return;
  }
  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';
  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }
  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z = ".responsive-datagrid-preview {\n  background-color: white;\n  border: dashed 1px #ced0d3;\n  border-radius: 4px;\n  margin-bottom: 24px;\n  padding: 8px;\n}\n\n.responsive-datagrid-preview p {margin: 0;}\n\n.responsive-datagrid .widget-datagrid .btn-td-collapse svg {\n    transition: transform 0.2s cubic-bezier(0.23, 1, 0.32, 1);\n    will-change: transform;\n}\n\n.responsive-datagrid .widget-datagrid .btn-td-collapse:hover {\n    cursor: pointer;\n}\n\n.responsive-datagrid .widget-datagrid .btn-td-collapse--active svg {\n    transform: rotate(180deg);\n}\n\n.responsive-datagrid .widget-datagrid .tr-collapsible:empty {\n    display: none;\n}\n\n.responsive-datagrid .widget-datagrid .tr-collapsible:not(:empty) {\n    background-color: var(--gray-lighter, #fafafa);\n    border-bottom: solid 1px var(--gray-lighter, #e8e8e8);\n    display: grid;\n    gap: var(--spacing-regular, 16px);\n    grid-column: 1 / -1;\n    padding: 15px var(--spacing-large, 24px);\n    @media screen and (max-width: 500px) {\n        grid-template-columns: repeat(2, 1fr);\n    }\n    @media screen and (min-width: 501px) {\n        grid-template-columns: repeat(3, 1fr);\n    }\n}\n\n.responsive-datagrid .widget-datagrid .tr-collapsible--collapsed {\n    display: none !important;\n}\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlc3BvbnNpdmVEYXRhZ3JpZFR3by5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDRSx1QkFBdUI7RUFDdkIsMEJBQTBCO0VBQzFCLGtCQUFrQjtFQUNsQixtQkFBbUI7RUFDbkIsWUFBWTtBQUNkOztBQUVBLGdDQUFnQyxTQUFTLENBQUM7O0FBRTFDO0lBQ0kseURBQXlEO0lBQ3pELHNCQUFzQjtBQUMxQjs7QUFFQTtJQUNJLGVBQWU7QUFDbkI7O0FBRUE7SUFDSSx5QkFBeUI7QUFDN0I7O0FBRUE7SUFDSSxhQUFhO0FBQ2pCOztBQUVBO0lBQ0ksOENBQThDO0lBQzlDLHFEQUFxRDtJQUNyRCxhQUFhO0lBQ2IsaUNBQWlDO0lBQ2pDLG1CQUFtQjtJQUNuQix3Q0FBd0M7SUFDeEM7UUFDSSxxQ0FBcUM7SUFDekM7SUFDQTtRQUNJLHFDQUFxQztJQUN6QztBQUNKOztBQUVBO0lBQ0ksd0JBQXdCO0FBQzVCIiwiZmlsZSI6IlJlc3BvbnNpdmVEYXRhZ3JpZFR3by5jc3MiLCJzb3VyY2VzQ29udGVudCI6WyIucmVzcG9uc2l2ZS1kYXRhZ3JpZC1wcmV2aWV3IHtcbiAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XG4gIGJvcmRlcjogZGFzaGVkIDFweCAjY2VkMGQzO1xuICBib3JkZXItcmFkaXVzOiA0cHg7XG4gIG1hcmdpbi1ib3R0b206IDI0cHg7XG4gIHBhZGRpbmc6IDhweDtcbn1cblxuLnJlc3BvbnNpdmUtZGF0YWdyaWQtcHJldmlldyBwIHttYXJnaW46IDA7fVxuXG4ucmVzcG9uc2l2ZS1kYXRhZ3JpZCAud2lkZ2V0LWRhdGFncmlkIC5idG4tdGQtY29sbGFwc2Ugc3ZnIHtcbiAgICB0cmFuc2l0aW9uOiB0cmFuc2Zvcm0gMC4ycyBjdWJpYy1iZXppZXIoMC4yMywgMSwgMC4zMiwgMSk7XG4gICAgd2lsbC1jaGFuZ2U6IHRyYW5zZm9ybTtcbn1cblxuLnJlc3BvbnNpdmUtZGF0YWdyaWQgLndpZGdldC1kYXRhZ3JpZCAuYnRuLXRkLWNvbGxhcHNlOmhvdmVyIHtcbiAgICBjdXJzb3I6IHBvaW50ZXI7XG59XG5cbi5yZXNwb25zaXZlLWRhdGFncmlkIC53aWRnZXQtZGF0YWdyaWQgLmJ0bi10ZC1jb2xsYXBzZS0tYWN0aXZlIHN2ZyB7XG4gICAgdHJhbnNmb3JtOiByb3RhdGUoMTgwZGVnKTtcbn1cblxuLnJlc3BvbnNpdmUtZGF0YWdyaWQgLndpZGdldC1kYXRhZ3JpZCAudHItY29sbGFwc2libGU6ZW1wdHkge1xuICAgIGRpc3BsYXk6IG5vbmU7XG59XG5cbi5yZXNwb25zaXZlLWRhdGFncmlkIC53aWRnZXQtZGF0YWdyaWQgLnRyLWNvbGxhcHNpYmxlOm5vdCg6ZW1wdHkpIHtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1ncmF5LWxpZ2h0ZXIsICNmYWZhZmEpO1xuICAgIGJvcmRlci1ib3R0b206IHNvbGlkIDFweCB2YXIoLS1ncmF5LWxpZ2h0ZXIsICNlOGU4ZTgpO1xuICAgIGRpc3BsYXk6IGdyaWQ7XG4gICAgZ2FwOiB2YXIoLS1zcGFjaW5nLXJlZ3VsYXIsIDE2cHgpO1xuICAgIGdyaWQtY29sdW1uOiAxIC8gLTE7XG4gICAgcGFkZGluZzogMTVweCB2YXIoLS1zcGFjaW5nLWxhcmdlLCAyNHB4KTtcbiAgICBAbWVkaWEgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA1MDBweCkge1xuICAgICAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCgyLCAxZnIpO1xuICAgIH1cbiAgICBAbWVkaWEgc2NyZWVuIGFuZCAobWluLXdpZHRoOiA1MDFweCkge1xuICAgICAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCgzLCAxZnIpO1xuICAgIH1cbn1cblxuLnJlc3BvbnNpdmUtZGF0YWdyaWQgLndpZGdldC1kYXRhZ3JpZCAudHItY29sbGFwc2libGUtLWNvbGxhcHNlZCB7XG4gICAgZGlzcGxheTogbm9uZSAhaW1wb3J0YW50O1xufVxuIl19 */";
var stylesheet=".responsive-datagrid-preview {\n  background-color: white;\n  border: dashed 1px #ced0d3;\n  border-radius: 4px;\n  margin-bottom: 24px;\n  padding: 8px;\n}\n\n.responsive-datagrid-preview p {margin: 0;}\n\n.responsive-datagrid .widget-datagrid .btn-td-collapse svg {\n    transition: transform 0.2s cubic-bezier(0.23, 1, 0.32, 1);\n    will-change: transform;\n}\n\n.responsive-datagrid .widget-datagrid .btn-td-collapse:hover {\n    cursor: pointer;\n}\n\n.responsive-datagrid .widget-datagrid .btn-td-collapse--active svg {\n    transform: rotate(180deg);\n}\n\n.responsive-datagrid .widget-datagrid .tr-collapsible:empty {\n    display: none;\n}\n\n.responsive-datagrid .widget-datagrid .tr-collapsible:not(:empty) {\n    background-color: var(--gray-lighter, #fafafa);\n    border-bottom: solid 1px var(--gray-lighter, #e8e8e8);\n    display: grid;\n    gap: var(--spacing-regular, 16px);\n    grid-column: 1 / -1;\n    padding: 15px var(--spacing-large, 24px);\n    @media screen and (max-width: 500px) {\n        grid-template-columns: repeat(2, 1fr);\n    }\n    @media screen and (min-width: 501px) {\n        grid-template-columns: repeat(3, 1fr);\n    }\n}\n\n.responsive-datagrid .widget-datagrid .tr-collapsible--collapsed {\n    display: none !important;\n}\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlc3BvbnNpdmVEYXRhZ3JpZFR3by5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDRSx1QkFBdUI7RUFDdkIsMEJBQTBCO0VBQzFCLGtCQUFrQjtFQUNsQixtQkFBbUI7RUFDbkIsWUFBWTtBQUNkOztBQUVBLGdDQUFnQyxTQUFTLENBQUM7O0FBRTFDO0lBQ0kseURBQXlEO0lBQ3pELHNCQUFzQjtBQUMxQjs7QUFFQTtJQUNJLGVBQWU7QUFDbkI7O0FBRUE7SUFDSSx5QkFBeUI7QUFDN0I7O0FBRUE7SUFDSSxhQUFhO0FBQ2pCOztBQUVBO0lBQ0ksOENBQThDO0lBQzlDLHFEQUFxRDtJQUNyRCxhQUFhO0lBQ2IsaUNBQWlDO0lBQ2pDLG1CQUFtQjtJQUNuQix3Q0FBd0M7SUFDeEM7UUFDSSxxQ0FBcUM7SUFDekM7SUFDQTtRQUNJLHFDQUFxQztJQUN6QztBQUNKOztBQUVBO0lBQ0ksd0JBQXdCO0FBQzVCIiwiZmlsZSI6IlJlc3BvbnNpdmVEYXRhZ3JpZFR3by5jc3MiLCJzb3VyY2VzQ29udGVudCI6WyIucmVzcG9uc2l2ZS1kYXRhZ3JpZC1wcmV2aWV3IHtcbiAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XG4gIGJvcmRlcjogZGFzaGVkIDFweCAjY2VkMGQzO1xuICBib3JkZXItcmFkaXVzOiA0cHg7XG4gIG1hcmdpbi1ib3R0b206IDI0cHg7XG4gIHBhZGRpbmc6IDhweDtcbn1cblxuLnJlc3BvbnNpdmUtZGF0YWdyaWQtcHJldmlldyBwIHttYXJnaW46IDA7fVxuXG4ucmVzcG9uc2l2ZS1kYXRhZ3JpZCAud2lkZ2V0LWRhdGFncmlkIC5idG4tdGQtY29sbGFwc2Ugc3ZnIHtcbiAgICB0cmFuc2l0aW9uOiB0cmFuc2Zvcm0gMC4ycyBjdWJpYy1iZXppZXIoMC4yMywgMSwgMC4zMiwgMSk7XG4gICAgd2lsbC1jaGFuZ2U6IHRyYW5zZm9ybTtcbn1cblxuLnJlc3BvbnNpdmUtZGF0YWdyaWQgLndpZGdldC1kYXRhZ3JpZCAuYnRuLXRkLWNvbGxhcHNlOmhvdmVyIHtcbiAgICBjdXJzb3I6IHBvaW50ZXI7XG59XG5cbi5yZXNwb25zaXZlLWRhdGFncmlkIC53aWRnZXQtZGF0YWdyaWQgLmJ0bi10ZC1jb2xsYXBzZS0tYWN0aXZlIHN2ZyB7XG4gICAgdHJhbnNmb3JtOiByb3RhdGUoMTgwZGVnKTtcbn1cblxuLnJlc3BvbnNpdmUtZGF0YWdyaWQgLndpZGdldC1kYXRhZ3JpZCAudHItY29sbGFwc2libGU6ZW1wdHkge1xuICAgIGRpc3BsYXk6IG5vbmU7XG59XG5cbi5yZXNwb25zaXZlLWRhdGFncmlkIC53aWRnZXQtZGF0YWdyaWQgLnRyLWNvbGxhcHNpYmxlOm5vdCg6ZW1wdHkpIHtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1ncmF5LWxpZ2h0ZXIsICNmYWZhZmEpO1xuICAgIGJvcmRlci1ib3R0b206IHNvbGlkIDFweCB2YXIoLS1ncmF5LWxpZ2h0ZXIsICNlOGU4ZTgpO1xuICAgIGRpc3BsYXk6IGdyaWQ7XG4gICAgZ2FwOiB2YXIoLS1zcGFjaW5nLXJlZ3VsYXIsIDE2cHgpO1xuICAgIGdyaWQtY29sdW1uOiAxIC8gLTE7XG4gICAgcGFkZGluZzogMTVweCB2YXIoLS1zcGFjaW5nLWxhcmdlLCAyNHB4KTtcbiAgICBAbWVkaWEgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA1MDBweCkge1xuICAgICAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCgyLCAxZnIpO1xuICAgIH1cbiAgICBAbWVkaWEgc2NyZWVuIGFuZCAobWluLXdpZHRoOiA1MDFweCkge1xuICAgICAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCgzLCAxZnIpO1xuICAgIH1cbn1cblxuLnJlc3BvbnNpdmUtZGF0YWdyaWQgLndpZGdldC1kYXRhZ3JpZCAudHItY29sbGFwc2libGUtLWNvbGxhcHNlZCB7XG4gICAgZGlzcGxheTogbm9uZSAhaW1wb3J0YW50O1xufVxuIl19 */";
styleInject(css_248z);

var ResponsiveDatagridTwo = /*#__PURE__*/Object.freeze({
	__proto__: null,
	'default': css_248z,
	stylesheet: stylesheet
});

var require$$0 = /*@__PURE__*/getDefaultExportFromNamespaceIfNotNamed(ResponsiveDatagridTwo);

function preview({
  dataGridWidget
}) {
  const ContentRenderer = dataGridWidget.renderer;
  return react.createElement("div", {
    className: "responsive-datagrid-preview"
  }, react.createElement(ContentRenderer, {
    caption: "Place a Datagridv2 widget inside."
  }, react.createElement("div", {
    className: "responsive-datagrid-preview-content"
  })));
}
function getPreviewCss() {
  return require$$0;
}

exports.getPreviewCss = getPreviewCss;
exports.preview = preview;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzcG9uc2l2ZURhdGFncmlkVHdvLmVkaXRvclByZXZpZXcuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1pbmplY3QvZGlzdC9zdHlsZS1pbmplY3QuZXMuanMiLCIuLi8uLi8uLi9zcmMvUmVzcG9uc2l2ZURhdGFncmlkVHdvLmVkaXRvclByZXZpZXcuanN4Il0sInNvdXJjZXNDb250ZW50IjpbImZ1bmN0aW9uIHN0eWxlSW5qZWN0KGNzcywgcmVmKSB7XG4gIGlmICggcmVmID09PSB2b2lkIDAgKSByZWYgPSB7fTtcbiAgdmFyIGluc2VydEF0ID0gcmVmLmluc2VydEF0O1xuXG4gIGlmICghY3NzIHx8IHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcpIHsgcmV0dXJuOyB9XG5cbiAgdmFyIGhlYWQgPSBkb2N1bWVudC5oZWFkIHx8IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF07XG4gIHZhciBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gIHN0eWxlLnR5cGUgPSAndGV4dC9jc3MnO1xuXG4gIGlmIChpbnNlcnRBdCA9PT0gJ3RvcCcpIHtcbiAgICBpZiAoaGVhZC5maXJzdENoaWxkKSB7XG4gICAgICBoZWFkLmluc2VydEJlZm9yZShzdHlsZSwgaGVhZC5maXJzdENoaWxkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaGVhZC5hcHBlbmRDaGlsZChzdHlsZSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xuICB9XG5cbiAgaWYgKHN0eWxlLnN0eWxlU2hlZXQpIHtcbiAgICBzdHlsZS5zdHlsZVNoZWV0LmNzc1RleHQgPSBjc3M7XG4gIH0gZWxzZSB7XG4gICAgc3R5bGUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzKSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgc3R5bGVJbmplY3Q7XG4iLCJpbXBvcnQgeyBjcmVhdGVFbGVtZW50IH0gZnJvbSBcInJlYWN0XCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBwcmV2aWV3KHsgZGF0YUdyaWRXaWRnZXQgfSkge1xuICAgIGNvbnN0IENvbnRlbnRSZW5kZXJlciA9IGRhdGFHcmlkV2lkZ2V0LnJlbmRlcmVyO1xuXG4gICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyZXNwb25zaXZlLWRhdGFncmlkLXByZXZpZXdcIj5cbiAgICAgICAgICAgIDxDb250ZW50UmVuZGVyZXIgY2FwdGlvbj1cIlBsYWNlIGEgRGF0YWdyaWR2MiB3aWRnZXQgaW5zaWRlLlwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicmVzcG9uc2l2ZS1kYXRhZ3JpZC1wcmV2aWV3LWNvbnRlbnRcIiAvPlxuICAgICAgICAgICAgPC9Db250ZW50UmVuZGVyZXI+XG4gICAgICAgIDwvZGl2PlxuICAgICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQcmV2aWV3Q3NzKCkge1xuICAgIHJldHVybiByZXF1aXJlKFwiLi91aS9SZXNwb25zaXZlRGF0YWdyaWRUd28uY3NzXCIpO1xufVxuIl0sIm5hbWVzIjpbInN0eWxlSW5qZWN0IiwiY3NzIiwicmVmIiwiaW5zZXJ0QXQiLCJkb2N1bWVudCIsImhlYWQiLCJnZXRFbGVtZW50c0J5VGFnTmFtZSIsInN0eWxlIiwiY3JlYXRlRWxlbWVudCIsInR5cGUiLCJmaXJzdENoaWxkIiwiaW5zZXJ0QmVmb3JlIiwiYXBwZW5kQ2hpbGQiLCJzdHlsZVNoZWV0IiwiY3NzVGV4dCIsImNyZWF0ZVRleHROb2RlIiwicHJldmlldyIsImRhdGFHcmlkV2lkZ2V0IiwiQ29udGVudFJlbmRlcmVyIiwicmVuZGVyZXIiLCJjbGFzc05hbWUiLCJjYXB0aW9uIiwiZ2V0UHJldmlld0NzcyIsInJlcXVpcmUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxTQUFTQSxXQUFXQSxDQUFDQyxHQUFHLEVBQUVDLEdBQUcsRUFBRTtFQUM3QixJQUFLQSxHQUFHLEtBQUssS0FBSyxDQUFDLEVBQUdBLEdBQUcsR0FBRyxFQUFFLENBQUE7QUFDOUIsRUFBQSxJQUFJQyxRQUFRLEdBQUdELEdBQUcsQ0FBQ0MsUUFBUSxDQUFBO0FBRTNCLEVBQUEsSUFBSSxDQUFDRixHQUFHLElBQUksT0FBT0csUUFBUSxLQUFLLFdBQVcsRUFBRTtBQUFFLElBQUEsT0FBQTtBQUFRLEdBQUE7QUFFdkQsRUFBQSxJQUFJQyxJQUFJLEdBQUdELFFBQVEsQ0FBQ0MsSUFBSSxJQUFJRCxRQUFRLENBQUNFLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ3BFLEVBQUEsSUFBSUMsS0FBSyxHQUFHSCxRQUFRLENBQUNJLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQTtFQUMzQ0QsS0FBSyxDQUFDRSxJQUFJLEdBQUcsVUFBVSxDQUFBO0VBRXZCLElBQUlOLFFBQVEsS0FBSyxLQUFLLEVBQUU7SUFDdEIsSUFBSUUsSUFBSSxDQUFDSyxVQUFVLEVBQUU7TUFDbkJMLElBQUksQ0FBQ00sWUFBWSxDQUFDSixLQUFLLEVBQUVGLElBQUksQ0FBQ0ssVUFBVSxDQUFDLENBQUE7QUFDM0MsS0FBQyxNQUFNO0FBQ0xMLE1BQUFBLElBQUksQ0FBQ08sV0FBVyxDQUFDTCxLQUFLLENBQUMsQ0FBQTtBQUN6QixLQUFBO0FBQ0YsR0FBQyxNQUFNO0FBQ0xGLElBQUFBLElBQUksQ0FBQ08sV0FBVyxDQUFDTCxLQUFLLENBQUMsQ0FBQTtBQUN6QixHQUFBO0VBRUEsSUFBSUEsS0FBSyxDQUFDTSxVQUFVLEVBQUU7QUFDcEJOLElBQUFBLEtBQUssQ0FBQ00sVUFBVSxDQUFDQyxPQUFPLEdBQUdiLEdBQUcsQ0FBQTtBQUNoQyxHQUFDLE1BQU07SUFDTE0sS0FBSyxDQUFDSyxXQUFXLENBQUNSLFFBQVEsQ0FBQ1csY0FBYyxDQUFDZCxHQUFHLENBQUMsQ0FBQyxDQUFBO0FBQ2pELEdBQUE7QUFDRjs7Ozs7Ozs7Ozs7Ozs7QUN2Qk8sU0FBU2UsT0FBT0EsQ0FBQztBQUFFQyxFQUFBQSxjQUFBQTtBQUFlLENBQUMsRUFBRTtBQUN4QyxFQUFBLE1BQU1DLGVBQWUsR0FBR0QsY0FBYyxDQUFDRSxRQUFRLENBQUE7QUFFL0MsRUFBQSxPQUNJWCxtQkFBQSxDQUFBLEtBQUEsRUFBQTtBQUFLWSxJQUFBQSxTQUFTLEVBQUMsNkJBQUE7R0FDWFosRUFBQUEsbUJBQUEsQ0FBQ1UsZUFBZSxFQUFBO0FBQUNHLElBQUFBLE9BQU8sRUFBQyxtQ0FBQTtBQUFtQyxHQUFBLEVBQ3hEYixtQkFBQSxDQUFBLEtBQUEsRUFBQTtBQUFLWSxJQUFBQSxTQUFTLEVBQUMscUNBQUE7R0FBdUMsQ0FDekMsQ0FDaEIsQ0FBQyxDQUFBO0FBRWQsQ0FBQTtBQUVPLFNBQVNFLGFBQWFBLEdBQUc7RUFDNUIsT0FBT0MsVUFBeUMsQ0FBQTtBQUNwRDs7Ozs7In0=
