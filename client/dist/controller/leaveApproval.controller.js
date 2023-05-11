sap.ui.define(["oft/fiori/controller/BaseController","sap/m/MessageBox","sap/m/MessageToast","oft/fiori/models/formatter","sap/ui/model/Filter"],function(e,t,r,i,a){"use strict";return e.extend("oft.fiori.controller.leaveApproval",{onInit:function(){debugger;this.oRouter=sap.ui.core.UIComponent.getRouterFor(this);this.oRouter.attachRoutePatternMatched(this.herculis,this);var e=this.getModel("local").getProperty("/CurrentUser");if(e){var t=this.getModel("local").oData.AppUsers[e].UserName;this.getView().byId("idUser").setText(t)}},onBeforeRendering:function(){},onBack:function(){sap.ui.getCore().byId("idApp").to("idView1")},formatDates:function(e,t){var r=sap.ui.core.format.DateFormat.getDateInstance({pattern:"dd.MM.YYYY"});var i=r.format(e);var a=r.format(t);return i+" - "+a},onSend:function(e,t,r){var i=this.getModel("local").getProperty("/AppUsers")[t].UserName;var a=this.getModel("local").getProperty("/AppUsers")[t].MobileNo;var s={};s.msgType=e;s.userName=i;s.requested=r;s.balance="?";s.Number=a;$.post("/requestMessage",s).done(function(e,t){sap.m.MessageToast.show("Message sent successfully")}).fail(function(e,t,r){sap.m.MessageBox.error(e.responseText)})},onApprove:function(e){debugger;var t=e.getSource().getBindingContext().sPath;var i=e.getSource().getModel().getProperty(t);var a=this;var s={Status:"Approved"};this.ODataHelper.callOData(this.getOwnerComponent().getModel(),t,"PUT",{},s,this).then(function(e){r.show("The Leave request has been approved");var t=a.getView().byId("idEmployee").getSelectedKey();a.reloadLeaves();a.onSend("leaveApproved",i.AppUserId,i.Days);if(t){a.getView().byId("pendingLeaveTable").getBinding("items").filter([new sap.ui.model.Filter("AppUserId",sap.ui.model.FilterOperator.EQ,"'"+t+"'"),new sap.ui.model.Filter("Status",sap.ui.model.FilterOperator.EQ,"Not Approved")]);a.getView().byId("approvedLeaveTable").getBinding("items").filter([new sap.ui.model.Filter("AppUserId",sap.ui.model.FilterOperator.EQ,"'"+t+"'"),new sap.ui.model.Filter("Status",sap.ui.model.FilterOperator.EQ,"Approved")]);debugger}else{}}).catch(function(e){a.getView().setBusy(false);var t=a.getErrorMessage(e)})},onDelete:function(e){debugger;var r=this;var i=e;var a=r.getView().byId("idEmployee").getSelectedKey();var s=e.getSource().getParent().getBindingContextPath();t.confirm("Do you want to delete the selected records?",function(e){if(e=="OK"){r.ODataHelper.callOData(r.getOwnerComponent().getModel(),s,"DELETE",{},{},r).then(function(e){sap.m.MessageToast.show("Deleted succesfully");r.reloadLeaves();if(a){r.getView().byId("pendingLeaveTable").getBinding("items").filter([new sap.ui.model.Filter("AppUserId",sap.ui.model.FilterOperator.EQ,"'"+a+"'"),new sap.ui.model.Filter("Status",sap.ui.model.FilterOperator.EQ,"Not Approved")]);r.getView().byId("approvedLeaveTable").getBinding("items").filter([new sap.ui.model.Filter("AppUserId",sap.ui.model.FilterOperator.EQ,"'"+a+"'"),new sap.ui.model.Filter("Status",sap.ui.model.FilterOperator.EQ,"Approved")])}else{}}).catch(function(e){r.getView().setBusy(false);r.oPopover=r.getErrorMessage(e);r.getView().setBusy(false)})}},"Confirmation")},onReject:function(e){debugger;var t=e.getSource().getBindingContext().sPath;var i=e.getSource().getModel().getProperty(t);var a=this;var s={Status:"Rejected"};var o=a.getView().byId("idEmployee").getSelectedKey();this.ODataHelper.callOData(this.getOwnerComponent().getModel(),t,"PUT",{},s,this).then(function(e){r.show("The Leave request has been Rejected");a.reloadLeaves();a.onSend("leaveReject",i.AppUserId,i.Days);if(o){a.getView().byId("pendingLeaveTable").getBinding("items").filter([new sap.ui.model.Filter("AppUserId",sap.ui.model.FilterOperator.EQ,"'"+o+"'"),new sap.ui.model.Filter("Status",sap.ui.model.FilterOperator.EQ,"Not Approved")]);a.getView().byId("approvedLeaveTable").getBinding("items").filter([new sap.ui.model.Filter("AppUserId",sap.ui.model.FilterOperator.EQ,"'"+o+"'"),new sap.ui.model.Filter("Status",sap.ui.model.FilterOperator.EQ,"Approved")])}else{}}).catch(function(e){a.getView().setBusy(false);var t=a.getErrorMessage(e)})},currentUser:"",techId:"",getName:function(e){if(e){return this.getModel("local").oData.AppUsers[e].UserName}},herculis:function(e){debugger;if(e.getParameter("name")!=="leaveApproval"){return}this.currentUser=this.getModel("local").getProperty("/CurrentUser");this.reloadLeaves();this.getView().byId("idEmployee").setValue("");this.getView().byId("idEmployee").setSelectedKey("")},onRefresh:function(){debugger;var e=this;var t=e.getView().byId("idEmployee").getSelectedKey();e.reloadLeaves();if(t){e.getView().byId("pendingLeaveTable").getBinding("items").filter([new sap.ui.model.Filter("AppUserId",sap.ui.model.FilterOperator.EQ,"'"+t+"'"),new sap.ui.model.Filter("Status",sap.ui.model.FilterOperator.EQ,"Not Approved")]);e.getView().byId("approvedLeaveTable").getBinding("items").filter([new sap.ui.model.Filter("AppUserId",sap.ui.model.FilterOperator.EQ,"'"+t+"'"),new sap.ui.model.Filter("Status",sap.ui.model.FilterOperator.EQ,"Approved")])}else{}},onSelect:function(e){debugger;var t=e.getSource().getSelectedKey();this.reloadLeaves();this.getView().byId("pendingLeaveTable").getBinding("items").filter([new sap.ui.model.Filter("AppUserId",sap.ui.model.FilterOperator.EQ,"'"+t+"'"),new sap.ui.model.Filter("Status",sap.ui.model.FilterOperator.EQ,"Not Approved")]);this.getView().byId("approvedLeaveTable").getBinding("items").filter([new sap.ui.model.Filter("Status",sap.ui.model.FilterOperator.EQ,"Approved"),new sap.ui.model.Filter("AppUserId",sap.ui.model.FilterOperator.EQ,"'"+t+"'")])},reloadLeaves:function(){debugger;this.getView().byId("pendingLeaveTable").bindItems({path:"/LeaveRequests",template:new sap.m.ColumnListItem({cells:[new sap.m.Text({text:{path:"AppUserId",formatter:this.getName.bind(this)}}),new sap.m.Text({text:{parts:[{path:"DateFrom"},{path:"DateTo"}],formatter:this.formatDates}}),new sap.m.Text({text:"{Days}"}),new sap.m.Button({text:"Approve",press:[this.onApprove,this]}),new sap.m.Button({text:"Reject",press:[this.onReject,this]})]})});this.getView().byId("pendingLeaveTable").getBinding("items").filter([new sap.ui.model.Filter("Status",sap.ui.model.FilterOperator.EQ,"Not Approved"),new sap.ui.model.Filter("AppUserId",sap.ui.model.FilterOperator.NE,"'"+this.currentUser+"'")]);this.getView().byId("approvedLeaveTable").bindItems({path:"/LeaveRequests",template:new sap.m.ColumnListItem({cells:[new sap.m.Text({text:{path:"AppUserId",formatter:this.getName.bind(this)}}),new sap.m.Text({text:{parts:[{path:"DateFrom"},{path:"DateTo"}],formatter:this.formatDates}}),new sap.m.Text({text:"{Days}"}),new sap.m.Button({text:"Delete",press:[this.onDelete,this]})]})});this.getView().byId("approvedLeaveTable").getBinding("items").filter([new sap.ui.model.Filter("Status",sap.ui.model.FilterOperator.EQ,"Approved"),new sap.ui.model.Filter("AppUserId",sap.ui.model.FilterOperator.NE,"'"+this.currentUser+"'")])},onUpdateFinished:function(e){debugger;var t=this.getView().byId("pendingLeaveTable");if(t.getBinding("items").isLengthFinal()){var r=t.getItems().length}this.getView().byId("pendingIcon").setCount(r);var i=this.getView().byId("approvedLeaveTable");if(i.getBinding("items").isLengthFinal()){var a=i.getItems().length}this.getView().byId("approveIcon").setCount(a)},onAfterRendering:function(){}})});
//# sourceMappingURL=leaveApproval.controller.js.map