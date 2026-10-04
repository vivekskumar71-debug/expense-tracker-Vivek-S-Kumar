let transactions = [];
let editingId = null;


const typeSelect = document.getElementById("type");

const categorySelect = document.getElementById("category");

const filterType = document.getElementById("filter-type");

const filterCategory = document.getElementById("filter-category");

const savedTransactions = localStorage.getItem("transactions");

const summaryMonth = document.getElementById("summary-month");

summaryMonth.addEventListener("change",function(){
    updateMonthlySummary();
});

if (savedTransactions){
    transactions = JSON.parse(savedTransactions);
}

function renderTransactions(){
    const transactionList = document.getElementById("transaction-list");

    transactionList.innerHTML = "";

    const filteredTransactions = transactions.filter(function(transaction) {
    if (filterType.value !== "all" && transaction.type !== filterType.value) {
        return false;
    }

    if (filterCategory.value !== "all" && transaction.category !== filterCategory.value) {
        return false;
    }

    return true;
    });

    filteredTransactions.forEach(function(transaction) {

        const transactionItem = document.createElement("div");
        transactionItem.classList.add("transaction-item")
        transactionItem.innerHTML = `
        <h3>${transaction.type}</h3>
        <h3>${transaction.category}</h3>
        <p>Amount: ₹${transaction.amount}</p>
        <p>Date: ${transaction.date}</p>
        <p>${transaction.description}</p>
        <button class="edit-btn"data-id="${transaction.id}">Edit</button>
        <button class="delete-btn"data-id="${transaction.id}">Delete</button>`;

        transactionList.appendChild(transactionItem);

    });
}
document.getElementById("transaction-list").addEventListener("click",function(event){

    if(event.target.classList.contains("delete-btn")){
        const id = Number(event.target.dataset.id);
        transactions = transactions.filter(function(transaction){
        return transaction.id!==id;
        });
        localStorage.setItem("transactions",JSON.stringify(transactions));

        renderTransactions();
    }
    if(event.target.classList.contains("edit-btn")){
        const id = Number(event.target.dataset.id);
        const transaction = transactions.find(function(transaction){
            return transaction.id === id;
        });

        editingId = id;

        document.getElementById("type").value = transaction.type;
        document.getElementById("amount").value = transaction.amount;
        document.getElementById("category").value = transaction.category;
        document.getElementById("date").value = transaction.date;
        document.getElementById("description").value = transaction.description;
    }
});

renderTransactions();

function updateTotals() {

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(function(transaction){

        if (transaction.type == "income"){
            totalIncome = totalIncome + Number(transaction.amount);
        }
        else{
            totalExpense = totalExpense + Number(transaction.amount);
        }

    });

    document.getElementById("total-income").textContent = `₹${totalIncome}`;
    document.getElementById("total-expense").textContent = `₹${totalExpense}`;
    document.getElementById("balance").textContent = `₹${totalIncome - totalExpense}`;
}

function updateMonthlySummary() {
    const selectedMonth = summaryMonth.value;

    let monthlyIncome = 0;
    let monthlyExpenses = 0;

    transactions.forEach(function(transaction) {
        if (transaction.date.startsWith(selectedMonth)) {

            if (transaction.type === "income") {
                monthlyIncome += Number(transaction.amount);
            } else {
                monthlyExpenses += Number(transaction.amount);
            }

        }
    });

    document.getElementById("monthly-income").textContent =`₹${monthlyIncome}`;

    document.getElementById("monthly-expenses").textContent =`₹${monthlyExpenses}`;

    document.getElementById("monthly-balance").textContent =`₹${monthlyIncome - monthlyExpenses}`;
}

updateTotals();

updateMonthlySummary();

updateCategoryChart();

function updateCategoryChart() {
    const categoryTotals = {};

    transactions.forEach(function(transaction) {
        if (transaction.type === "expense") {
            if (!categoryTotals[transaction.category]) {
                categoryTotals[transaction.category] = 0;
            }

            categoryTotals[transaction.category] += Number(transaction.amount);
        }
    });

    const chart = document.getElementById("category-chart");

    chart.innerHTML = "";

    const maxAmount = Math.max(...Object.values(categoryTotals));

    for (const category in categoryTotals) {
        chart.innerHTML += `
        <div class="category-bar">
            <div class="category-bar-label">
                ${category}: ₹${categoryTotals[category]}
            </div>
            <div class="category-bar-fill" style="width: ${(categoryTotals[category] / maxAmount) * 100}%"></div>
        </div>`;
        }
}

typeSelect.addEventListener("change",function(){
    if (typeSelect.value == "income"){
        categorySelect.innerHTML = `
        <option value="salary">Salary</option>
        <option value="freelance">Freelance</option>
        <option value="business">Business</option>
        <option value="gift">Gift</option>
        <option value="other">Other</option>`;
    }
    else {
        categorySelect.innerHTML = `
        <option value="food">Food</option>
        <option value="transport">Transport</option>
        <option value="shopping">Shopping</option>
        <option value="bills">Bills</option>
        <option value="entertainment">Entertainment</option>
        <option value="other">Other</option>
    `;
    }
});

filterType.addEventListener("change", function() {
    if (filterType.value === "income") {
        filterCategory.innerHTML = `
        <option value="all">All Categories</option>
        <option value="salary">Salary</option>
        <option value="freelance">Freelance</option>
        <option value="business">Business</option>
        <option value="gift">Gift</option>
        <option value="other">Other</option>`;
    } 
    else if (filterType.value === "expense") {
        filterCategory.innerHTML = `
        <option value="all">All Categories</option>
        <option value="food">Food</option>
        <option value="transport">Transport</option>
        <option value="shopping">Shopping</option>
        <option value="bills">Bills</option>
        <option value="entertainment">Entertainment</option>
        <option value="other">Other</option>`;
    } 
    else {
        filterCategory.innerHTML = `
        <option value="all">All Categories</option>`;
    }
});

filterType.addEventListener("change",function(){
    renderTransactions();
});

filterCategory.addEventListener("change",function(){
    renderTransactions();
});


const form = document.getElementById("transaction-form");

form.addEventListener("submit",function(event){
    event.preventDefault();

    const amount = document.getElementById("amount").value;

    if(amount <= 0){
        alert("Please enter a valid amount.")
        return;
    }

    const type = document.getElementById("type").value;
    
    const category = document.getElementById("category").value;
    
    const date = document.getElementById("date").value;

    if(date=== ""){
        alert("Please select a date.")
        return;
    }
    
    const description = document.getElementById("description").value;
    
    if(description.trim() === ""){
        alert("Please enter a description.")
        return;
    }

    const transaction = {
        id: Date.now(),
        type: type,
        amount:amount,
        category:category,
        date:date,
        description:description
    }

    if (editingId === null) {
    transactions.push(transaction);
        } 
    else {
        transactions = transactions.map(function(item) {
            if (item.id === editingId) {
                return {
                    id: editingId,
                    type: type,
                    amount: amount,
                    category: category,
                    date: date,
                    description: description
                    };
                }

                return item;
        });
    }

    editingId = null; 

    localStorage.setItem("transactions",JSON.stringify(transactions));

    renderTransactions();
    updateTotals();

    console.log(transactions);

});


