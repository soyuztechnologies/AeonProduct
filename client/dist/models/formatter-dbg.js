sap.ui.define([], function() {
    return {
        getFormattedDate: function(monthInc) {
            var dateObj = new Date();
            dateObj.setDate(dateObj.getDate());
            var dd = dateObj.getDate();
            dateObj.setMonth(dateObj.getMonth() + monthInc);
            var mm = dateObj.getMonth() + 1;
            var yyyy = dateObj.getFullYear();
            if (dd < 10) {
                dd = '0' + dd;
            }
            if (mm < 10) {
                mm = '0' + mm;
            }
            return dd + '.' + mm + '.' + yyyy;
        },
        getTaskText: function(type) {
            switch (type) {
                case "GB":
                    return "Google Business Post";
                    break;
                case "LP":
                    return "Linkedin Post";
                    break;
                case "FP":
                    return "Facebook Post";
                    break;
                case "TW":
                    return "Tweets";
                    break;
                case "ST":
                    return "SEO Tools MR,GSA";
                    break;
                case "CI":
                    return "Customer Interaction Calls/Mails";
                    break;
                case "PT":
                    return "Pinterest Post";
                    break;
                case "SW":
                    return "SAP Server Work";
                    break;
                case "WD":
                    return "Website Development";
                    break;
                case "WR":
                    return "Website Review posts";
                    break;
                case "TR":
                    return "Trainings";
                    break;
                case "TM":
                    return "Team Meeting";
                    break;
                case "TE":
                    return "Team Event";
                    break;
                case "SE":
                    return "Self Learning";
                    break;
                case "OT":
                    return "Others";
                    break;

                default:

            }
        },
        getIndianCurr: function(value) {
            var x = value;
            x = x.toString();
            var lastThree = x.substring(x.length - 3);
            var otherNumbers = x.substring(0, x.length - 3);
            if (otherNumbers != '')
                lastThree = ',' + lastThree;
            var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
            return res;
        },
        sortByProperty: function(array, property) {
            var lol = function dynamicSort(property) {
                var sortOrder = 1;
                if (property[0] === "-") {
                    sortOrder = -1;
                    property = property.substr(1);
                }
                return function(a, b) {
                    var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
                    return result * sortOrder;
                }
            };

            return array.sort(lol(property));
        },
        getIncrementDate: function(dateObj, monthInc) {
            debugger;
            //	var dd = dateObj.getDate();
            dateObj.setMonth(dateObj.getMonth() + monthInc);
            var dd = dateObj.getDate();
            var mm = dateObj.getMonth() + 1;
            var yyyy = dateObj.getFullYear();
            if (dd < 10) {
                dd = '0' + dd;
            }
            if (mm < 10) {
                mm = '0' + mm;
            }
            return dd + '.' + mm + '.' + yyyy;
        },
        getDateCheck: function(dateObj) {
            var dd = dateObj.getDate();
            var mm = dateObj.getMonth();
            var yyyy = dateObj.getFullYear();

            var ddToday = new Date();

            var dd1 = ddToday.getDate();
            var mm1 = ddToday.getMonth();
            var yyyy1 = ddToday.getFullYear();

            debugger;
            if (yyyy > yyyy1) {
                return true;
            } else {
                if (yyyy == yyyy1) {
                    if (mm > mm1) {
                        return true;
                    } else {
                        if (mm == mm1) {
                            if (dd > dd1) {
                                return true;
                            } else {
                                return false;
                            }
                        } else {
                            return false;
                        }
                    }
                } else { //(yyyy < yyyy1)
                    return false;
                }
            }
        },
        formatButtonStatus: function(oValue) {
            if (oValue == "Approved") {
                return false;
            } else {
                return true;
            }
        },
        formatIconColor: function(bValue) {
            if (bValue === true) {
                return "red";
            } else {
                return "green";
            }
        },

        formatRowHighlight: function(bValue) {
            if (bValue === true) {
                return "Error";
            } else {
                return "Success";
            }
        },
        formatLRdate: function(dateF, dateT) {
            debugger;
            if (dateF === dateT) {
                return dateF;
            }
            var c = dateF.concat('-', dateT);
            return c;
        },
        formatLRStatus: function(status) {
            switch (status) {
                case "Not Approved":
                    return sap.ui.core.ValueState.Warning;
                case "Approved":
                    return sap.ui.core.ValueState.Success;
                case "Rejected":
                    return sap.ui.core.ValueState.Error;
                default:
                    return sap.ui.core.ValueState.None;

            }
        },
        formatAvailable: function(leaves) {
            debugger;
            if (leaves >= 18) {
                return sap.ui.core.ValueState.Error;
            } else {
                return sap.ui.core.ValueState.Success;
            }

        },
        formatStatusValue: function(sValue) {
            debugger;
            switch (sValue) {
                case "L":
                    return "Live";
                case "V":
                    return "Video";
                case "A":
                    return "Live and Video";
            }
        }



    };
});
