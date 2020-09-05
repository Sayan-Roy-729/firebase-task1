$(document).ready(function () {
    // firebase configuration
    var firebaseConfig = {
        apiKey: "AIzaSyDZXv1GEe4NeGqZvrDKAYMPweHkfkAu9dY",
        authDomain: "expense-729.firebaseapp.com",
        databaseURL: "https://expense-729.firebaseio.com",
        projectId: "expense-729",
        storageBucket: "expense-729.appspot.com",
        messagingSenderId: "585829944930",
        appId: "1:585829944930:web:a1b474cfc65aa529c14b3b",
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    // Initialiging Firebase Database
    let expense = firebase.database().ref("expense");

    // -----------------adding user inputs in the expense node after clicking "add" button-----------------------
    $("#add").click(function () {
        let transaction_name = $("#transactionName").val();
        let transaction_details = $("#transactionDetails").val();
        let transaction_amount = $("#transactionAmount").val();

        let credit;

        if ($("#credit").is(":checked")) {
            credit = "Credit";
        } else {
            credit = "Debit";
        }

        if (
            transaction_name != "" &&
            transaction_amount != "" &&
            $.isNumeric(transaction_amount) === true
        ) {
            // Fetching Date & Time from
            let date = new Date();

            let year = date.getFullYear();
            let month = date.getMonth() + 1;
            let day = date.getDate();
            let now_date = String(year) + "-" + String(month) + "-" + String(day);

            let hour = date.getHours();
            let minute = date.getMinutes();
            let second = date.getSeconds();

            let now_time = String(hour) + ":" + String(minute) + ":" + String(second);

            let ecpenseRef = expense.push({
                trans_name: transaction_name,
                amount: transaction_amount,
                ckeck: credit,
                details: transaction_details,
                time: now_time,
                date: now_date,
            });

            $("#alert").append(`
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                <strong>Added!</strong> Your expense is added.
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
                </button>
            </div>
            `);

            $("#transactionName").val("");
            $("#transactionAmount").val("");
            $("#credit").val("");
            $("#transactionDetails").val("");
        } else {
            alert("Please fill out the fields");
        }
    });

    // for last 10 transaction(Part1: calculating the savings & Part2: last 10 transaction) ----------------------------------------------------------------------------------------

    var ref = firebase.database().ref();

    ref.on("value", function (snapshot) {
        var key_list = [];

        data = snapshot.val();

        if (data == null) {
            $("#last_10_transaction").html("");
        }

        datavalue = data["expense"];

        let credit = 0;
        let debit = 0;

        // Part1 : for calculation of savings amount ------>
        for (let key in data["expense"]) {
            key_list.push(key);

            if (data["expense"][key]["ckeck"] == "Credit") {
                credit += Number(data["expense"][key]["amount"]);
            } else {
                debit += Number(data["expense"][key]["amount"]);
            }
        }

        let savings = credit - debit;
        $("#savings").text(savings.toFixed(2));

        $("#last_10_transaction").html("");

        // Part2 : for last 10 transactions ------->

        if (key_list.length <= 10) {
            let count_in_if = 0;
            // if there is less than 10 data in server
            for (let i = 0; i < key_list.length; i++) {
                count_in_if++;

                let dataTargetId = "ModalView-" + count_in_if;
                let editModalId_If = "modalEdit-" + count_in_if;

                let id = key_list[i];
                let transaction_type = data["expense"][id]["ckeck"];
                let class_name;

                if (transaction_type == "Credit") {
                    class_name = "bg-dark_green";
                } else {
                    class_name = "bg-danger";
                }

                $("#last_10_transaction").append(`
                <div class="row">
                <div class="col-md-3 col-sm-3 col-3 text-center text-light">${data["expense"][id]["trans_name"]}</div>
                <div class="col-md-3 col-sm-3 col-3 text-center text-light">${data["expense"][id]["amount"]}</div>
                <div class="col-md-2 col-sm-2 col-2 text-center text-light">${data["expense"][id]["date"]}</div>
                <div class="col-md-2 col-sm-2 col-2 text-center text-light">${data["expense"][id]["time"]}</div>

                <div class="col-md-2 col-sm-2 col-2 text-center text-light"><button class="btn btn-danger" id="edit-${count_in_if}" data-toggle="modal" data-target="#${editModalId_If}">Edit</button></div>
                </div>

                <hr style="height: 5px;" id = "division" class = "${class_name}">
                `);

                // adding modal for editing
                $("#last10transactionEdit").append(`

                <div class="modal fade" id="${editModalId_If}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Edit</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    </div>



                    <div class="modal-body">
                        <div class="container">
                            <div class="row">
                                <div class="col-md-12 col-sm-12 col-12">
                                    <form>
                                        <div class="form-group">
                                          <label for="exampleInputEmail1">Transaction Name</label>
                                          <input type="text" class="form-control" id="editTransactionName-${count_in_if}" aria-describedby="emailHelp">
                                        </div>
                                        <div class="form-group">
                                            <label for="exampleInputPassword1">Transaction Details</label>
                                            <input type="text" class="form-control" id="editTransactionDetails-${count_in_if}">
                                        </div>
                                        <div class="form-group">
                                            <label for="exampleInputPassword1">Amount</label>
                                            <input type="number" class="form-control" id="editTransactionAmount-${count_in_if}">
                                        </div>
                                        <div class="form-group form-check">
                                            <input type="checkbox" class="form-check-input" id="editTransactionCredit-${count_in_if}">
                                            <label class="form-check-label" for="exampleCheck1">Credit</label>
                                        </div>
                                      </form> <hr class="bg-muted">
                                </div>
                                <div><button class="btn btn-danger" id="deleteList" data-id = "${key_list[i]}__${count_in_if}" data-dismiss="modal">Delete this transaction</button></div>
                            </div>
                        </div>
                    </div>

                

                    <div class="modal-footer" id="${count_in_if}" data-id="${key_list[i]}">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal" id = "close-${count_in_if}"data-id = "${key_list[i]}">Close</button>
                    <button type="button" class="btn btn-primary" id="editModalSaveButton" data-dismiss="modal">Save changes</button>
                    </div>
                </div>
                </div>
            </div>
                `);
            }

            // if there is more than or equal to 10 data in server
        } else if (key_list.length >= 10) {
            length = key_list.length;

            let difference = key_list.length - 10;

            let count_in_if_else = 0;
            for (let j = difference; j < length; j++) {
                count_in_if_else++;
                let dataTargetId_Else = "ModalView-" + count_in_if_else;
                let editModalId_Else = "modalEdit-" + count_in_if_else;

                let id = key_list[j];
                let transaction_type = data["expense"][id]["ckeck"];
                let class_name;

                if (transaction_type == "Credit") {
                    class_name = "bg-dark_green";
                } else {
                    class_name = "bg-danger";
                }

                $("#last_10_transaction").append(`
                <div class="row">
                <div class="col-md-3 col-sm-3 col-3 text-center text-light">${data["expense"][id]["trans_name"]}</div>
                <div class="col-md-3 col-sm-3 col-3 text-center text-light">${data["expense"][id]["amount"]}</div>
                <div class="col-md-2 col-sm-2 col-2 text-center text-light">${data["expense"][id]["date"]}</div>
                <div class="col-md-2 col-sm-2 col-2 text-center text-light">${data["expense"][id]["time"]}</div>

                <div class="col-md-2 col-sm-2 col-2 text-center text-light"><button class="btn btn-danger" id="edit-${count_in_if_else}" data-toggle="modal" data-target="#${editModalId_Else}">Edit</button></div>
                </div>

                <hr style="height: 5px;" id = "division" class = "${class_name}">
                `);

                // adding modal for editing
                $("#last10transactionEdit").append(`

                <div class="modal fade" id="${editModalId_Else}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Edit</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    </div>



                    <div class="modal-body">
                        <div class="container">
                            <div class="row">
                                <div class="col-md-12 col-sm-12 col-12">
                                    <form>
                                        <div class="form-group">
                                          <label for="exampleInputEmail1">Transaction Name</label>
                                          <input type="text" class="form-control" id="editTransactionName-${count_in_if_else}" aria-describedby="emailHelp">
                                        </div>
                                        <div class="form-group">
                                          <label for="exampleInputPassword1">Transaction Details</label>
                                          <input type="text" class="form-control" id="editTransactionDetails-${count_in_if_else}">
                                        </div>
                                        <div class="form-group">
                                          <label for="exampleInputPassword1">Amount</label>
                                          <input type="number" class="form-control" id="editTransactionAmount-${count_in_if_else}">
                                        </div>
                                        <div class="form-group form-check">
                                          <input type="checkbox" class="form-check-input" id="editTransactionCredit-${count_in_if_else}">
                                          <label class="form-check-label" for="exampleCheck1">Credit</label>
                                        </div>
                                      </form><hr class="bg-muted">

                                      
                                </div>
                                <div>
                                <button class="btn btn-danger" id="deleteList" data-id = "${key_list[j]}__${count_in_if_else}" data-dismiss="modal">Delete this transaction</button></div>
                            </div>
                        </div>
                    </div>



                    <div class="modal-footer" id="${count_in_if_else}" data-id="${key_list[j]}">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal" id = "close-${count_in_if_else}"data-id = "${key_list[j]}" data-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" id="editModalSaveButton" data-dismiss="modal">Save changes</button>
                    </div>
                </div>
                </div>
            </div>
                
                `);
            }
        }
    });

    // --------------------------------for history-----------------------------

    $(document).on("click", "#historyModalMain", function () {
        ref.on("value", function (snapshot) {
            data = snapshot.val();

            count_history = 0;

            //------------------------daily history--------------------
            let dailyHistoryCredit = 0;
            let dailyHistoryDebit = 0;
            $("#historyModalDaily").html("");
            $("#historymodalviewcontainer").html("");
            for (let key in data["expense"]) {
                count_history++;
                let dataTargetId_ModalHistoryDaily =
                    "ModalHistoryDailyView-" + count_history;

                if (data["expense"][key]["ckeck"] == "Credit") {
                    dailyHistoryCredit += Number(data["expense"][key]["amount"]);
                } else {
                    dailyHistoryDebit += Number(data["expense"][key]["amount"]);
                }

                let dailyHistorySavings = dailyHistoryCredit - dailyHistoryDebit;

                $("#dailyHistorySummery_Credit").text(dailyHistoryCredit);
                $("#dailyHistorySummery_Debit").text(dailyHistoryDebit);
                $("#dailyHistorySummery_Savings").text(dailyHistorySavings);

                let btn_id = "dailyHistoryModal-" + count_history;

                let amount = data["expense"][key]["amount"];
                let date = data["expense"][key]["date"];
                let type = data["expense"][key]["ckeck"];
                let details = data["expense"][key]["details"];
                let time = data["expense"][key]["time"];

                $("#historyModalDaily").append(`
                        <div class="row">
                            <div class="col-md-4 col-sm-4 col-4">${amount}</div>
                            <div class="col-md-4 col-sm-4 col-4">${date}</div>
                            <div class="col-md-4 col-sm-4 col-4"><Button class="btn btn-primary" id = "${btn_id}" data-toggle="modal" data-target="#${dataTargetId_ModalHistoryDaily}">Details</Button></div>
                        </div>

                            <hr>
                    `);

                $("#historymodalviewcontainer")
                    .append(`<div class="modal fade" id="${dataTargetId_ModalHistoryDaily}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div class="modal-dialog">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title" id="exampleModalLabel">${data["expense"][key]["trans_name"]}</h5>
                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
    
                                <div class="modal-body">
                                    <div class="container">
                                        <div class="row">
                                            <div class="col-md-4 col-sm-4 col-4">Amount</div>
                                                <div class="col-md-4 col-sm-8 col-8">Rs. <span id="viewAmount">${amount}</span></div>
                                            </div>
                                        <hr>
    
                        <div id="viewDetails">
    
                            <div class="row">
                                <div class="col-md-4 col-sm-4 col-4">Type</div>
                                <div class="col-md-8 col-sm-8 col-8">${type}</div>
                            </div>
    
                            <hr>

                            <div class="row">
                                <div class="col-md-4 col-sm-4 col-4">Trns Details</div>
                                <div class="col-md-8 col-sm-8 col-8">${details}</div>
                            </div>
    
                            <hr>

                            <div class="row">
                                <div class="col-md-4 col-sm-4 col-4">Date</div>
                                <div class="col-md-8 col-sm-8 col-8">${date}</div>
                            </div>
    
                            <hr>

                            <div class="row">
                                <div class="col-md-4 col-sm-4 col-4">Time</div>
                                <div class="col-md-8 col-sm-8 col-8">${time}</div>
                            </div>
    
                            <hr>
                        </div>
                    </div>
                    </div>
    
    
    
                    <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    </div>
                </div>
                </div>
            </div>`);
            }
        });
    });

    // ----------------------------------for editing -----------------------------------------
    $(document).on("click", "#editModalSaveButton", function () {
        $(this)
            .parent()
            .attr("id")
            .split("  ")
            .map(function (clssName) {
                number = clssName;

                let taskId = $(`#close-${number}`).data("id");

                let transName = "editTransactionName-" + number;
                let transDetails = "editTransactionDetails-" + number;
                let transAmount = "editTransactionAmount-" + number;
                let checkboxid = "editTransactionCredit-" + number;

                let editedTransactionName = $(`#${transName}`).val();
                let editedTransactionDetails = $(`#${transDetails}`).val();
                let editedTransactionAmount = $(`#${transAmount}`).val();
                let credit;

                if ($(`#${checkboxid}`).is(":checked")) {
                    credit = "Credit";
                } else {
                    credit = "Debit";
                }

                if (editedTransactionName != "") {
                    firebase
                        .database()
                        .ref("expense/" + taskId)
                        .update({
                            trans_name: editedTransactionName,
                        });
                }

                if (editedTransactionDetails != "") {
                    firebase
                        .database()
                        .ref("expense/" + taskId)
                        .update({
                            details: editedTransactionDetails,
                        });
                }

                if (editedTransactionAmount != "") {
                    firebase
                        .database()
                        .ref("expense/" + taskId)
                        .update({
                            amount: editedTransactionAmount,
                        });
                }

                firebase
                    .database()
                    .ref("expense/" + taskId)
                    .update({
                        ckeck: credit,
                    });

                $("#editAlert").append(`
                    <div class="alert alert-success alert-dismissible fade show" role="alert">
                        <strong>Edited!</strong> Your expense is edited.
                        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
            `);

                ref.on("value", function (snapshot) {
                    data = snapshot.val();

                    count_history = 0;

                    //------------------------daily history--------------------
                    let dailyHistoryCredit = 0;
                    let dailyHistoryDebit = 0;
                    $("#historyModalDaily").html("");
                    $("#historymodalviewcontainer").html("");
                    for (let key in data["expense"]) {
                        count_history++;
                        let dataTargetId_ModalHistoryDaily =
                            "ModalHistoryDailyView-" + count_history;

                        if (data["expense"][key]["ckeck"] == "Credit") {
                            dailyHistoryCredit += Number(data["expense"][key]["amount"]);
                        } else {
                            dailyHistoryDebit += Number(data["expense"][key]["amount"]);
                        }

                        let dailyHistorySavings = dailyHistoryCredit - dailyHistoryDebit;

                        $("#dailyHistorySummery_Credit").text(dailyHistoryCredit);
                        $("#dailyHistorySummery_Debit").text(dailyHistoryDebit);
                        $("#dailyHistorySummery_Savings").text(dailyHistorySavings);

                        let btn_id = "dailyHistoryModal-" + count_history;

                        let amount = data["expense"][key]["amount"];
                        let date = data["expense"][key]["date"];
                        let type = data["expense"][key]["ckeck"];
                        let details = data["expense"][key]["details"];
                        let time = data["expense"][key]["time"];

                        $("#historyModalDaily").append(`
                        <div class="row">
                            <div class="col-md-4 col-sm-4 col-4">${amount}</div>
                            <div class="col-md-4 col-sm-4 col-4">${date}</div>
                            <div class="col-md-4 col-sm-4 col-4"><Button class="btn btn-primary" id = "${btn_id}" data-toggle="modal" data-target="#${dataTargetId_ModalHistoryDaily}">Details</Button></div>
                        </div>

                            <hr>
                    `);

                        $("#historymodalviewcontainer")
                            .append(`<div class="modal fade" id="${dataTargetId_ModalHistoryDaily}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div class="modal-dialog">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title" id="exampleModalLabel">${data["expense"][key]["trans_name"]}</h5>
                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
    
                                <div class="modal-body">
                                    <div class="container">
                                        <div class="row">
                                            <div class="col-md-4 col-sm-4 col-4">Amount</div>
                                                <div class="col-md-4 col-sm-8 col-8">Rs. <span id="viewAmount">${amount}</span></div>
                                            </div>
                                        <hr>
    
                        <div id="viewDetails">
    
                            <div class="row">
                                <div class="col-md-4 col-sm-4 col-4">Type</div>
                                <div class="col-md-8 col-sm-8 col-8">${type}</div>
                            </div>
    
                            <hr>

                            <div class="row">
                                <div class="col-md-4 col-sm-4 col-4">Trns Details</div>
                                <div class="col-md-8 col-sm-8 col-8">${details}</div>
                            </div>
    
                            <hr>

                            <div class="row">
                                <div class="col-md-4 col-sm-4 col-4">Date</div>
                                <div class="col-md-8 col-sm-8 col-8">${date}</div>
                            </div>
    
                            <hr>

                            <div class="row">
                                <div class="col-md-4 col-sm-4 col-4">Time</div>
                                <div class="col-md-8 col-sm-8 col-8">${time}</div>
                            </div>
    
                            <hr>
                        </div>
                    </div>
                    </div>
    
    
    
                    <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    </div>
                </div>
                </div>
            </div>`);
                    }
                });
            });
    });

    // delete the last expense
    $(document).on("click", "#deleteList", function () {
        let values = $(this).data("id");

        let deletevalues = values.split("__");

        let delete_key = deletevalues[0];
        let delete_count = deletevalues[1];

        firebase
            .database()
            .ref("expense/" + delete_key)
            .remove();

        console.log(delete_key);

        $("#editAlert").append(`
                    <div class="alert alert-danger alert-dismissible fade show" role="alert">
                        <strong>Deleted!</strong> &nbsp; Your expense is deleted.
                        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
            `);
    });
});
