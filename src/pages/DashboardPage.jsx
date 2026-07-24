import { useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CategoryIcon from '@mui/icons-material/Category';
import api from '../api/axiosInstance.js';
import {
  Box, Card, Typography, CircularProgress, Alert,
  Chip, Stack, Container, Fab, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Button, IconButton, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import NavBar from '../components/NavBar.jsx';

function DashboardPage() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [total, setTotal] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [grandTotal, setGrandTotal] = useState(null);   
  const [budget, setBudget] = useState(null);
  const [budgetInput, setBudgetInput] = useState('');
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
const [addingCategory, setAddingCategory] = useState(false);

  const fetchExpenses = (categoryName = '', month = '', year = '') => {
    let url = '/expenses';
    if (categoryName) {
      url = `/expenses?category=${categoryName}`;
    } else if (month && year) {
      url = `/expenses?month=${month}&year=${year}`;
    }

    api.get(url)
      .then((response) => {
        setExpenses(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load expenses.');
        setLoading(false);
      });
  };

  const fetchTotal = (categoryName) => {
    if (!categoryName) {
      setTotal(null);
      return;
    }
    api.get(`/expenses/total?category=${categoryName}`)
      .then((response) => setTotal(response.data))
      .catch(() => setTotal(null));
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    fetchExpenses(selectedCategory);
    fetchTotal(selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    api.get('/categories')
      .then((response) => setCategories(response.data))
      .catch(() => console.error('Failed to load categories'));
  }, []);

  useEffect(() => {
    if (selectedMonth && selectedYear) {
      fetchExpenses('', selectedMonth, selectedYear);
    }
  }, [selectedMonth, selectedYear]);

  const handleOpenDialog = () => {
    setAmount('');
    setCategoryId('');
    setDate('');
    setNote('');
    setFormError('');
    setDialogOpen(true);
  };

  const handleCreateExpense = async () => {
    setFormError('');
    try {
      await api.post('/expenses', {
        amount: parseFloat(amount),
        categoryId,
        date,
        note,
      });
      setDialogOpen(false);
      fetchExpenses();
    } catch (err) {
      setFormError('Failed to create expense. Check your inputs.');
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);
      fetchExpenses();
    } catch {
      setError('Failed to delete expense.');
    }
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setSelectedMonth('');
    setSelectedYear('');
  };

  const handleMonthYearChange = (month, year) => {
    setSelectedCategory('');
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  const handleUpdateBudget = async () => {
  try {
    const response = await api.put('/users/budget', {
      newMonthlyBudget: parseFloat(budgetInput),
    });
    console.log('Budget response:', JSON.stringify(response.data));
console.log('Full response object:', response);
    setBudget(response.data.monthlyBudgetLimit);
    setBudgetDialogOpen(false);
  } catch (err) {
    console.error('Failed to update budget');
  }
};

const handleAddCategory = async () => {
  if (!newCategoryName.trim()) return;
  try {
    const response = await api.post('/categories', { name: newCategoryName });
    setCategories([...categories, response.data]);
    setCategoryId(response.data.id);
    setNewCategoryName('');
    setAddingCategory(false);
  } catch (err) {
    console.error('Failed to create category');
  }
};

  const handleShowGrandTotal = () => {         // ADD THIS FUNCTION
  api.get('/expenses')
    .then((response) => {
      const sum = response.data.reduce((acc, exp) => acc + parseFloat(exp.amount), 0);
      setGrandTotal(sum);
    })
    .catch(() => setGrandTotal(null));
};

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

 return (
  <>
    <NavBar />
  
  <Container maxWidth="lg" sx={{ pt: 6, pb: 10 }}>
    <Typography variant="h4" fontWeight={600} gutterBottom sx={{ mb: 4 }}>
      Your Expenses
    </Typography>

    <Grid container spacing={4}>
      {/* LEFT COLUMN: filters + expense list */}
      <Grid item xs={12} sm={8}>
        <TextField
          select
          label="Filter by Category"
          fullWidth
          sx={{ mb: 3 }}
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
        >
          <MenuItem value="">All Categories</MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat.id} value={cat.name}>
              {cat.name}
            </MenuItem>
          ))}
        </TextField>

        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <TextField
            select
            label="Month"
            fullWidth
            value={selectedMonth}
            onChange={(e) => handleMonthYearChange(e.target.value, selectedYear)}
          >
            <MenuItem value="">Any</MenuItem>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <MenuItem key={m} value={m}>{m}</MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Year"
            fullWidth
            value={selectedYear}
            onChange={(e) => handleMonthYearChange(selectedMonth, e.target.value)}
          >
            <MenuItem value="">Any</MenuItem>
            {[2024, 2025, 2026].map((y) => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </TextField>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}


        <TableContainer component={Card} sx={{ mb: 3 }}>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Amount</TableCell>
        <TableCell>Category</TableCell>
        <TableCell>Date</TableCell>
        <TableCell>Note</TableCell>
        <TableCell align="right">Actions</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {expenses.length === 0 ? (
        <TableRow>
          <TableCell colSpan={5} align="center">
            <Typography color="text.secondary" sx={{ py: 3 }}>
              No expenses yet — add your first one to get started.
            </Typography>
          </TableCell>
        </TableRow>
      ) : (
        expenses.map((expense) => (
          <TableRow key={expense.id} hover>
            <TableCell>
              <Typography fontWeight={700} color="primary.main">
                ₹{expense.amount}
              </Typography>
            </TableCell>
            <TableCell>
              <Chip
                icon={<CategoryIcon sx={{ fontSize: 16 }} />}
                label={expense.category?.name}
                size="small"
                sx={{ backgroundColor: 'rgba(127, 90, 240, 0.2)' }}
              />
            </TableCell>
            <TableCell>{expense.date}</TableCell>
            <TableCell>
              <Typography variant="body2" color="text.secondary">
                {expense.note}
              </Typography>
            </TableCell>
            <TableCell align="right">
              <IconButton size="small" onClick={() => handleDeleteExpense(expense.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </TableCell>
          </TableRow>
        ))
      )}
    </TableBody>
  </Table>
</TableContainer>
      </Grid>

      {/* RIGHT COLUMN: totals sidebar */}
      <Grid item xs={12} sm={4}>
        <Stack spacing={2} sx={{ position: { md: 'sticky' }, top: { md: 24 } }}>

          <Button
              variant="outlined"
              fullWidth
              onClick={() => setBudgetDialogOpen(true)}
            >
              {budget !== null ? `Budget: ₹${budget}` : 'Set Monthly Budget'}
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleShowGrandTotal}
          >
            Show Total Across All Expenses
          </Button>

{grandTotal !== null && (
  <Card sx={{ p: 2, textAlign: 'center' }}>
    <Typography variant="body2" color="text.secondary">
      Total Across All Expenses
    </Typography>
    <Typography variant="h5" fontWeight={700} color="primary.main">
      ₹{grandTotal.toFixed(2)}
    </Typography>
    {budget !== null && grandTotal > budget && (
      <Alert severity="warning" sx={{ mt: 1 }}>
        Over budget by ₹{(grandTotal - budget).toFixed(2)}
      </Alert>
    )}
  </Card>
)}

          {selectedCategory && total !== null && (
            <Card sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Total for {selectedCategory}
              </Typography>
              <Typography variant="h5" fontWeight={700} color="primary.main">
                ₹{total}
              </Typography>
            </Card>
          )}
        </Stack>
      </Grid>
    </Grid>

    <Fab
      color="primary"
      sx={{ position: 'fixed', bottom: 32, right: 32 }}
      onClick={handleOpenDialog}
    >
      <AddIcon />
    </Fab>

    <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
      <DialogTitle>Add Expense</DialogTitle>
      <DialogContent>
        <TextField
          label="Amount"
          type="number"
          fullWidth
          margin="normal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
<TextField
  select
  label="Category"
  fullWidth
  margin="normal"
  value={categoryId}
  onChange={(e) => {
    if (e.target.value === 'ADD_NEW') {
      setAddingCategory(true);
    } else {
      setCategoryId(e.target.value);
    }
  }}
>
  {categories.map((cat) => (
    <MenuItem key={cat.id} value={cat.id}>
      {cat.name}
    </MenuItem>
  ))}
  <MenuItem value="ADD_NEW">
    <em>+ Add New Category</em>
  </MenuItem>
</TextField>

{addingCategory && (
  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
    <TextField
      label="New Category Name"
      fullWidth
      value={newCategoryName}
      onChange={(e) => setNewCategoryName(e.target.value)}
    />
    <Button variant="contained" onClick={handleAddCategory}>
      Add
    </Button>
  </Stack>
)}
        <TextField
          label="Date"
          type="date"
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <TextField
          label="Note"
          fullWidth
          margin="normal"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        {formError && <Alert severity="error" sx={{ mt: 1 }}>{formError}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
        <Button variant="contained" onClick={handleCreateExpense}>Save</Button>
      </DialogActions>
    </Dialog>

    <Dialog open={budgetDialogOpen} onClose={() => setBudgetDialogOpen(false)} fullWidth maxWidth="xs">
  <DialogTitle>Set Monthly Budget</DialogTitle>
  <DialogContent>
    <TextField
      label="Monthly Budget"
      type="number"
      fullWidth
      margin="normal"
      value={budgetInput}
      onChange={(e) => setBudgetInput(e.target.value)}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setBudgetDialogOpen(false)}>Cancel</Button>
    <Button variant="contained" onClick={handleUpdateBudget}>Save</Button>
  </DialogActions>
</Dialog>
  </Container>
  </>
);
}

export default DashboardPage;