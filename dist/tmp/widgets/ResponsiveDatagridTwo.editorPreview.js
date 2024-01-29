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

var css_248z = ".responsive-datagrid .widget-datagrid .btn-td-collapse svg {\n    transition: transform 0.2s cubic-bezier(0.23, 1, 0.32, 1);\n    will-change: transform;\n}\n\n.responsive-datagrid .widget-datagrid .btn-td-collapse:hover {\n    cursor: pointer;\n}\n\n.responsive-datagrid .widget-datagrid .btn-td-collapse--active svg {\n    transform: rotate(180deg);\n}\n\n.responsive-datagrid .widget-datagrid .tr-collapsible:empty {\n    display: none;\n}\n\n.responsive-datagrid .widget-datagrid .tr-collapsible:not(:empty) {\n    background-color: var(--gray, #fafafa);\n    border-bottom: solid 1px var(--gray-lighter, #e8e8e8);\n    display: grid;\n    gap: var(--spacing-regular, 16px);\n    grid-column: 1 / -1;\n    padding: 15px var(--spacing-large, 24px);\n    @media screen and (max-width: 500px) {\n        grid-template-columns: repeat(2, 1fr);\n    }\n    @media screen and (min-width: 501px) {\n        grid-template-columns: repeat(3, 1fr);\n    }\n}\n\n.responsive-datagrid .widget-datagrid .tr-collapsible--collapsed {\n    display: none !important;\n}\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlc3BvbnNpdmVEYXRhZ3JpZFR3by5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7SUFDSSx5REFBeUQ7SUFDekQsc0JBQXNCO0FBQzFCOztBQUVBO0lBQ0ksZUFBZTtBQUNuQjs7QUFFQTtJQUNJLHlCQUF5QjtBQUM3Qjs7QUFFQTtJQUNJLGFBQWE7QUFDakI7O0FBRUE7SUFDSSxzQ0FBc0M7SUFDdEMscURBQXFEO0lBQ3JELGFBQWE7SUFDYixpQ0FBaUM7SUFDakMsbUJBQW1CO0lBQ25CLHdDQUF3QztJQUN4QztRQUNJLHFDQUFxQztJQUN6QztJQUNBO1FBQ0kscUNBQXFDO0lBQ3pDO0FBQ0o7O0FBRUE7SUFDSSx3QkFBd0I7QUFDNUIiLCJmaWxlIjoiUmVzcG9uc2l2ZURhdGFncmlkVHdvLmNzcyIsInNvdXJjZXNDb250ZW50IjpbIi5yZXNwb25zaXZlLWRhdGFncmlkIC53aWRnZXQtZGF0YWdyaWQgLmJ0bi10ZC1jb2xsYXBzZSBzdmcge1xuICAgIHRyYW5zaXRpb246IHRyYW5zZm9ybSAwLjJzIGN1YmljLWJlemllcigwLjIzLCAxLCAwLjMyLCAxKTtcbiAgICB3aWxsLWNoYW5nZTogdHJhbnNmb3JtO1xufVxuXG4ucmVzcG9uc2l2ZS1kYXRhZ3JpZCAud2lkZ2V0LWRhdGFncmlkIC5idG4tdGQtY29sbGFwc2U6aG92ZXIge1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbn1cblxuLnJlc3BvbnNpdmUtZGF0YWdyaWQgLndpZGdldC1kYXRhZ3JpZCAuYnRuLXRkLWNvbGxhcHNlLS1hY3RpdmUgc3ZnIHtcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZSgxODBkZWcpO1xufVxuXG4ucmVzcG9uc2l2ZS1kYXRhZ3JpZCAud2lkZ2V0LWRhdGFncmlkIC50ci1jb2xsYXBzaWJsZTplbXB0eSB7XG4gICAgZGlzcGxheTogbm9uZTtcbn1cblxuLnJlc3BvbnNpdmUtZGF0YWdyaWQgLndpZGdldC1kYXRhZ3JpZCAudHItY29sbGFwc2libGU6bm90KDplbXB0eSkge1xuICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWdyYXksICNmYWZhZmEpO1xuICAgIGJvcmRlci1ib3R0b206IHNvbGlkIDFweCB2YXIoLS1ncmF5LWxpZ2h0ZXIsICNlOGU4ZTgpO1xuICAgIGRpc3BsYXk6IGdyaWQ7XG4gICAgZ2FwOiB2YXIoLS1zcGFjaW5nLXJlZ3VsYXIsIDE2cHgpO1xuICAgIGdyaWQtY29sdW1uOiAxIC8gLTE7XG4gICAgcGFkZGluZzogMTVweCB2YXIoLS1zcGFjaW5nLWxhcmdlLCAyNHB4KTtcbiAgICBAbWVkaWEgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA1MDBweCkge1xuICAgICAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCgyLCAxZnIpO1xuICAgIH1cbiAgICBAbWVkaWEgc2NyZWVuIGFuZCAobWluLXdpZHRoOiA1MDFweCkge1xuICAgICAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCgzLCAxZnIpO1xuICAgIH1cbn1cblxuLnJlc3BvbnNpdmUtZGF0YWdyaWQgLndpZGdldC1kYXRhZ3JpZCAudHItY29sbGFwc2libGUtLWNvbGxhcHNlZCB7XG4gICAgZGlzcGxheTogbm9uZSAhaW1wb3J0YW50O1xufVxuIl19 */";
var stylesheet=".responsive-datagrid .widget-datagrid .btn-td-collapse svg {\n    transition: transform 0.2s cubic-bezier(0.23, 1, 0.32, 1);\n    will-change: transform;\n}\n\n.responsive-datagrid .widget-datagrid .btn-td-collapse:hover {\n    cursor: pointer;\n}\n\n.responsive-datagrid .widget-datagrid .btn-td-collapse--active svg {\n    transform: rotate(180deg);\n}\n\n.responsive-datagrid .widget-datagrid .tr-collapsible:empty {\n    display: none;\n}\n\n.responsive-datagrid .widget-datagrid .tr-collapsible:not(:empty) {\n    background-color: var(--gray, #fafafa);\n    border-bottom: solid 1px var(--gray-lighter, #e8e8e8);\n    display: grid;\n    gap: var(--spacing-regular, 16px);\n    grid-column: 1 / -1;\n    padding: 15px var(--spacing-large, 24px);\n    @media screen and (max-width: 500px) {\n        grid-template-columns: repeat(2, 1fr);\n    }\n    @media screen and (min-width: 501px) {\n        grid-template-columns: repeat(3, 1fr);\n    }\n}\n\n.responsive-datagrid .widget-datagrid .tr-collapsible--collapsed {\n    display: none !important;\n}\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlc3BvbnNpdmVEYXRhZ3JpZFR3by5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7SUFDSSx5REFBeUQ7SUFDekQsc0JBQXNCO0FBQzFCOztBQUVBO0lBQ0ksZUFBZTtBQUNuQjs7QUFFQTtJQUNJLHlCQUF5QjtBQUM3Qjs7QUFFQTtJQUNJLGFBQWE7QUFDakI7O0FBRUE7SUFDSSxzQ0FBc0M7SUFDdEMscURBQXFEO0lBQ3JELGFBQWE7SUFDYixpQ0FBaUM7SUFDakMsbUJBQW1CO0lBQ25CLHdDQUF3QztJQUN4QztRQUNJLHFDQUFxQztJQUN6QztJQUNBO1FBQ0kscUNBQXFDO0lBQ3pDO0FBQ0o7O0FBRUE7SUFDSSx3QkFBd0I7QUFDNUIiLCJmaWxlIjoiUmVzcG9uc2l2ZURhdGFncmlkVHdvLmNzcyIsInNvdXJjZXNDb250ZW50IjpbIi5yZXNwb25zaXZlLWRhdGFncmlkIC53aWRnZXQtZGF0YWdyaWQgLmJ0bi10ZC1jb2xsYXBzZSBzdmcge1xuICAgIHRyYW5zaXRpb246IHRyYW5zZm9ybSAwLjJzIGN1YmljLWJlemllcigwLjIzLCAxLCAwLjMyLCAxKTtcbiAgICB3aWxsLWNoYW5nZTogdHJhbnNmb3JtO1xufVxuXG4ucmVzcG9uc2l2ZS1kYXRhZ3JpZCAud2lkZ2V0LWRhdGFncmlkIC5idG4tdGQtY29sbGFwc2U6aG92ZXIge1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbn1cblxuLnJlc3BvbnNpdmUtZGF0YWdyaWQgLndpZGdldC1kYXRhZ3JpZCAuYnRuLXRkLWNvbGxhcHNlLS1hY3RpdmUgc3ZnIHtcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZSgxODBkZWcpO1xufVxuXG4ucmVzcG9uc2l2ZS1kYXRhZ3JpZCAud2lkZ2V0LWRhdGFncmlkIC50ci1jb2xsYXBzaWJsZTplbXB0eSB7XG4gICAgZGlzcGxheTogbm9uZTtcbn1cblxuLnJlc3BvbnNpdmUtZGF0YWdyaWQgLndpZGdldC1kYXRhZ3JpZCAudHItY29sbGFwc2libGU6bm90KDplbXB0eSkge1xuICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWdyYXksICNmYWZhZmEpO1xuICAgIGJvcmRlci1ib3R0b206IHNvbGlkIDFweCB2YXIoLS1ncmF5LWxpZ2h0ZXIsICNlOGU4ZTgpO1xuICAgIGRpc3BsYXk6IGdyaWQ7XG4gICAgZ2FwOiB2YXIoLS1zcGFjaW5nLXJlZ3VsYXIsIDE2cHgpO1xuICAgIGdyaWQtY29sdW1uOiAxIC8gLTE7XG4gICAgcGFkZGluZzogMTVweCB2YXIoLS1zcGFjaW5nLWxhcmdlLCAyNHB4KTtcbiAgICBAbWVkaWEgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA1MDBweCkge1xuICAgICAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCgyLCAxZnIpO1xuICAgIH1cbiAgICBAbWVkaWEgc2NyZWVuIGFuZCAobWluLXdpZHRoOiA1MDFweCkge1xuICAgICAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCgzLCAxZnIpO1xuICAgIH1cbn1cblxuLnJlc3BvbnNpdmUtZGF0YWdyaWQgLndpZGdldC1kYXRhZ3JpZCAudHItY29sbGFwc2libGUtLWNvbGxhcHNlZCB7XG4gICAgZGlzcGxheTogbm9uZSAhaW1wb3J0YW50O1xufVxuIl19 */";
styleInject(css_248z);

var ResponsiveDatagridTwo = /*#__PURE__*/Object.freeze({
	__proto__: null,
	'default': css_248z,
	stylesheet: stylesheet
});

var require$$0 = /*@__PURE__*/getDefaultExportFromNamespaceIfNotNamed(ResponsiveDatagridTwo);

function preview() {
  return react.createElement("div", null);
}
function getPreviewCss() {
  return require$$0;
}

exports.getPreviewCss = getPreviewCss;
exports.preview = preview;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzcG9uc2l2ZURhdGFncmlkVHdvLmVkaXRvclByZXZpZXcuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1pbmplY3QvZGlzdC9zdHlsZS1pbmplY3QuZXMuanMiLCIuLi8uLi8uLi9zcmMvUmVzcG9uc2l2ZURhdGFncmlkVHdvLmVkaXRvclByZXZpZXcuanN4Il0sInNvdXJjZXNDb250ZW50IjpbImZ1bmN0aW9uIHN0eWxlSW5qZWN0KGNzcywgcmVmKSB7XG4gIGlmICggcmVmID09PSB2b2lkIDAgKSByZWYgPSB7fTtcbiAgdmFyIGluc2VydEF0ID0gcmVmLmluc2VydEF0O1xuXG4gIGlmICghY3NzIHx8IHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcpIHsgcmV0dXJuOyB9XG5cbiAgdmFyIGhlYWQgPSBkb2N1bWVudC5oZWFkIHx8IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF07XG4gIHZhciBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gIHN0eWxlLnR5cGUgPSAndGV4dC9jc3MnO1xuXG4gIGlmIChpbnNlcnRBdCA9PT0gJ3RvcCcpIHtcbiAgICBpZiAoaGVhZC5maXJzdENoaWxkKSB7XG4gICAgICBoZWFkLmluc2VydEJlZm9yZShzdHlsZSwgaGVhZC5maXJzdENoaWxkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaGVhZC5hcHBlbmRDaGlsZChzdHlsZSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xuICB9XG5cbiAgaWYgKHN0eWxlLnN0eWxlU2hlZXQpIHtcbiAgICBzdHlsZS5zdHlsZVNoZWV0LmNzc1RleHQgPSBjc3M7XG4gIH0gZWxzZSB7XG4gICAgc3R5bGUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzKSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgc3R5bGVJbmplY3Q7XG4iLCJpbXBvcnQgeyBjcmVhdGVFbGVtZW50IH0gZnJvbSBcInJlYWN0XCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBwcmV2aWV3KCkge1xuICAgIHJldHVybiA8ZGl2PjwvZGl2Pjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFByZXZpZXdDc3MoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmUoXCIuL3VpL1Jlc3BvbnNpdmVEYXRhZ3JpZFR3by5jc3NcIik7XG59XG4iXSwibmFtZXMiOlsic3R5bGVJbmplY3QiLCJjc3MiLCJyZWYiLCJpbnNlcnRBdCIsImRvY3VtZW50IiwiaGVhZCIsImdldEVsZW1lbnRzQnlUYWdOYW1lIiwic3R5bGUiLCJjcmVhdGVFbGVtZW50IiwidHlwZSIsImZpcnN0Q2hpbGQiLCJpbnNlcnRCZWZvcmUiLCJhcHBlbmRDaGlsZCIsInN0eWxlU2hlZXQiLCJjc3NUZXh0IiwiY3JlYXRlVGV4dE5vZGUiLCJwcmV2aWV3IiwiZ2V0UHJldmlld0NzcyIsInJlcXVpcmUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxTQUFTQSxXQUFXQSxDQUFDQyxHQUFHLEVBQUVDLEdBQUcsRUFBRTtFQUM3QixJQUFLQSxHQUFHLEtBQUssS0FBSyxDQUFDLEVBQUdBLEdBQUcsR0FBRyxFQUFFLENBQUE7QUFDOUIsRUFBQSxJQUFJQyxRQUFRLEdBQUdELEdBQUcsQ0FBQ0MsUUFBUSxDQUFBO0FBRTNCLEVBQUEsSUFBSSxDQUFDRixHQUFHLElBQUksT0FBT0csUUFBUSxLQUFLLFdBQVcsRUFBRTtBQUFFLElBQUEsT0FBQTtBQUFRLEdBQUE7QUFFdkQsRUFBQSxJQUFJQyxJQUFJLEdBQUdELFFBQVEsQ0FBQ0MsSUFBSSxJQUFJRCxRQUFRLENBQUNFLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ3BFLEVBQUEsSUFBSUMsS0FBSyxHQUFHSCxRQUFRLENBQUNJLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQTtFQUMzQ0QsS0FBSyxDQUFDRSxJQUFJLEdBQUcsVUFBVSxDQUFBO0VBRXZCLElBQUlOLFFBQVEsS0FBSyxLQUFLLEVBQUU7SUFDdEIsSUFBSUUsSUFBSSxDQUFDSyxVQUFVLEVBQUU7TUFDbkJMLElBQUksQ0FBQ00sWUFBWSxDQUFDSixLQUFLLEVBQUVGLElBQUksQ0FBQ0ssVUFBVSxDQUFDLENBQUE7QUFDM0MsS0FBQyxNQUFNO0FBQ0xMLE1BQUFBLElBQUksQ0FBQ08sV0FBVyxDQUFDTCxLQUFLLENBQUMsQ0FBQTtBQUN6QixLQUFBO0FBQ0YsR0FBQyxNQUFNO0FBQ0xGLElBQUFBLElBQUksQ0FBQ08sV0FBVyxDQUFDTCxLQUFLLENBQUMsQ0FBQTtBQUN6QixHQUFBO0VBRUEsSUFBSUEsS0FBSyxDQUFDTSxVQUFVLEVBQUU7QUFDcEJOLElBQUFBLEtBQUssQ0FBQ00sVUFBVSxDQUFDQyxPQUFPLEdBQUdiLEdBQUcsQ0FBQTtBQUNoQyxHQUFDLE1BQU07SUFDTE0sS0FBSyxDQUFDSyxXQUFXLENBQUNSLFFBQVEsQ0FBQ1csY0FBYyxDQUFDZCxHQUFHLENBQUMsQ0FBQyxDQUFBO0FBQ2pELEdBQUE7QUFDRjs7Ozs7Ozs7Ozs7Ozs7QUN2Qk8sU0FBU2UsT0FBT0EsR0FBRztFQUN0QixPQUFPUixtQkFBQSxZQUFVLENBQUMsQ0FBQTtBQUN0QixDQUFBO0FBRU8sU0FBU1MsYUFBYUEsR0FBRztFQUM1QixPQUFPQyxVQUF5QyxDQUFBO0FBQ3BEOzs7OzsifQ==
