sap.ui.define([],function(){

return {

  getFirstDateOfMonth:function(date){

      var firstdate = new Date(date.getFullYear(),date.getMonth(),1);
      return firstdate;
  },
  getLastDateOfMonth:function(date){
      var lastdate = new Date(date.getFullYear(),date.getMonth()+1,0);
      return lastdate;
  },
  getNextDate:function(date,arg){
    var nDate = new Date(date.getFullYear(),date.getMonth(),arg)

      return nDate;
  },
  getNumberOfDaysInMonth:function(date){
    var year = date.getFullYear();
    var month = date.getMonth();
  //  var Days = getDaysInMonth(month,year);
      return new Date(year, month, 0).getDate();
  }
};


});
