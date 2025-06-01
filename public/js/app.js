const expenseForm = document.getElementById('expenseForm');
const titleInput = document.getElementById('title');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const dateInput = document.getElementById('date');
const expensesTableBody = document.getElementById('expensesTableBody');
const filterCategory = document.getElementById('filterCategory');
const filterFromDate = document.getElementById('filterFromDate');
const filterToDate = document.getElementById('filterToDate');
const applyFilterBtn = document.getElementById('applyFilter');
const clearFilterBtn = document.getElementById('clearFilter');
const chartCanvas = document.getElementById('expenseChart');

let expenses = [];
let chart;

// Fetch expenses from server
async function fetchExpenses() {
  try {
    const res = await fetch('/api/expenses');
    expenses = await res.json();
    renderExpenses(expenses);
    drawChart(expenses);
  } catch (err) {
    console.error(err);
  }
}

// Render expenses in the table
function renderExpenses(data) {
  expensesTableBody.innerHTML = '';
  if (data.length === 0) {
    expensesTableBody.innerHTML = '<tr><td colspan="5">No expenses found.</td></tr>';
    return;
  }

  data.forEach(exp => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${exp.title}</td>
      <td>${exp.amount.toFixed(2)}</td>
      <td>${exp.category}</td>
      <td>${new Date(exp.date).toLocaleDateString()}</td>
      <td><button class="delete-btn" data-id="${exp._id}">Delete</button></td>
    `;
    expensesTableBody.appendChild(tr);
  });
}

// Draw pie chart
function drawChart(data) {
  const categoryTotals = {};

  data.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });

  const categories = Object.keys(categoryTotals);
  const amounts = Object.values(categoryTotals);

  if (chart) chart.destroy();

  chart = new Chart(chartCanvas, {
    type: 'pie',
    data: {
      labels: categories,
      datasets: [{
        data: amounts,
        backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#8bc34a', '#9c27b0'],
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    }
  });

  chartCanvas.style.maxWidth = '400px';
  chartCanvas.style.maxHeight = '400px';
}

// Submit form to add new expense
expenseForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const category = categoryInput.value;
  const date = dateInput.value;

  if (!title || isNaN(amount) || !category || !date) {
    alert('Please fill all fields correctly.');
    return;
  }

  try {
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, amount, category, date })
    });

    if (!res.ok) throw new Error('Failed to add expense');

    titleInput.value = '';
    amountInput.value = '';
    categoryInput.value = '';
    dateInput.value = '';

    await fetchExpenses();
  } catch (err) {
    alert(err.message);
  }
});

// Delete expense
expensesTableBody.addEventListener('click', async (e) => {
  if (e.target.classList.contains('delete-btn')) {
    const id = e.target.dataset.id;
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      await fetchExpenses();
    } catch (err) {
      alert(err.message);
    }
  }
});

// Apply filters
applyFilterBtn.addEventListener('click', () => {
  const category = filterCategory.value;
  const from = filterFromDate.value;
  const to = filterToDate.value;

  const filtered = expenses.filter(exp => {
    const date = new Date(exp.date);
    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;
    const matchCategory = !category || exp.category === category;
    const matchFrom = !fromDate || date >= fromDate;
    const matchTo = !toDate || date <= toDate;
    return matchCategory && matchFrom && matchTo;
  });

  renderExpenses(filtered);
  drawChart(filtered);
});

// Clear filters
clearFilterBtn.addEventListener('click', () => {
  filterCategory.value = '';
  filterFromDate.value = '';
  filterToDate.value = '';
  renderExpenses(expenses);
  drawChart(expenses);
});

// Initial fetch
fetchExpenses();

new Chart(ctx, {
  type: 'pie',
  data: {
    labels: Object.keys(categoryTotals),
    datasets: [{
      data: Object.values(categoryTotals),
      backgroundColor: [
        '#4CAF50', '#2196F3', '#FFC107', '#E91E63', '#9C27B0'
      ],
      borderWidth: 2,
      hoverOffset: 15
    }]
  },
  options: {
    responsive: true,
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1200,
      easing: 'easeOutBounce'
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#333',
          font: {
            size: 14,
            weight: '500'
          }
        }
      }
    }
  }
});

