# Frontend Integration Guide

This guide shows you how to connect your existing HTML frontend to the new backend API.

## 🎯 Overview

You'll modify the `index.html` file to:
1. Replace the in-memory `CCLDI_DATABASE` with API calls
2. Add API communication functions
3. Handle loading states and errors
4. Update all CRUD operations to use the backend

## 📝 Step-by-Step Integration

### Step 1: Add API Configuration

Add this at the top of your `<script>` section in `index.html`:

```javascript
// API Configuration
const API_BASE_URL = 'http://localhost:3000/api'; // Change for production

// API Helper Functions
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        alert(`Error: ${error.message}`);
        throw error;
    }
}

// Loading state management
function showLoading() {
    // Add a loading indicator to your UI
    const contentArea = document.getElementById('contentArea');
    if (contentArea) {
        contentArea.style.opacity = '0.5';
        contentArea.style.pointerEvents = 'none';
    }
}

function hideLoading() {
    const contentArea = document.getElementById('contentArea');
    if (contentArea) {
        contentArea.style.opacity = '1';
        contentArea.style.pointerEvents = 'auto';
    }
}
```

### Step 2: Replace Database Object

**Remove** the entire `CCLDI_DATABASE` object and replace it with API calls.

### Step 3: Update Data Fetching Functions

Replace your current functions with these API-connected versions:

```javascript
// Fetch all centers
async function fetchCenters() {
    const response = await apiCall('/centers');
    return response.data;
}

// Fetch all students (with optional filters)
async function fetchStudents(centerId = 'all', search = '') {
    let endpoint = '/students?status=active';
    if (centerId !== 'all') {
        endpoint += `&centerId=${centerId}`;
    }
    if (search) {
        endpoint += `&search=${encodeURIComponent(search)}`;
    }
    const response = await apiCall(endpoint);
    return response.data;
}

// Fetch student AR details
async function fetchStudentAR(studentId) {
    const response = await apiCall(`/students/${studentId}/ar`);
    return response.data;
}

// Fetch billing records
async function fetchBillingRecords(centerId = 'all') {
    let endpoint = '/billing';
    if (centerId !== 'all') {
        endpoint += `?centerId=${centerId}`;
    }
    const response = await apiCall(endpoint);
    return response.data;
}

// Fetch aging report
async function fetchAgingReport(centerId = 'all') {
    let endpoint = '/billing/aging-report';
    if (centerId !== 'all') {
        endpoint += `?centerId=${centerId}`;
    }
    const response = await apiCall(endpoint);
    return response.data;
}

// Fetch settings
async function fetchSettings() {
    const response = await apiCall('/settings');
    return response.data;
}

// Fetch center statistics
async function fetchCenterStats(centerId) {
    const response = await apiCall(`/centers/${centerId}/stats`);
    return response.data;
}
```

### Step 4: Update CRUD Operations

```javascript
// Create new student
async function saveStudent() {
    const form = document.getElementById('studentForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const studentData = {
        firstName: document.getElementById('studentFirstName').value,
        lastName: document.getElementById('studentLastName').value,
        age: parseInt(document.getElementById('studentAge').value),
        gender: document.getElementById('studentGender').value,
        parent: document.getElementById('studentParent').value,
        contact: document.getElementById('studentContact').value,
        email: document.getElementById('studentEmail').value,
        centerId: document.getElementById('studentCenter').value,
        tuition: parseFloat(document.getElementById('studentTuition').value)
    };

    showLoading();

    try {
        if (editingStudentId) {
            // Update existing student
            await apiCall(`/students/${editingStudentId}`, {
                method: 'PUT',
                body: JSON.stringify(studentData)
            });
        } else {
            // Create new student
            await apiCall('/students', {
                method: 'POST',
                body: JSON.stringify(studentData)
            });
        }

        closeStudentModal();
        await renderPage(); // Refresh the page with new data
    } catch (error) {
        console.error('Error saving student:', error);
    } finally {
        hideLoading();
    }
}

// Delete student
async function deleteStudent(studentId) {
    if (!confirm('Are you sure you want to delete this student?')) {
        return;
    }

    showLoading();

    try {
        await apiCall(`/students/${studentId}`, {
            method: 'DELETE'
        });
        await renderPage(); // Refresh the page
    } catch (error) {
        console.error('Error deleting student:', error);
    } finally {
        hideLoading();
    }
}

// Record payment
async function recordPayment() {
    const form = document.getElementById('billingForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const paymentData = {
        studentId: parseInt(document.getElementById('billingStudent').value),
        type: document.getElementById('billingType').value,
        amount: parseFloat(document.getElementById('billingAmount').value),
        paymentDate: document.getElementById('billingDate').value,
        notes: document.getElementById('billingNotes').value
    };

    showLoading();

    try {
        await apiCall('/billing', {
            method: 'POST',
            body: JSON.stringify(paymentData)
        });

        closeBillingModal();
        await renderPage(); // Refresh the page
    } catch (error) {
        console.error('Error recording payment:', error);
    } finally {
        hideLoading();
    }
}

// Update setting
async function updateSetting(key, value) {
    showLoading();

    try {
        await apiCall(`/settings/${key}`, {
            method: 'PUT',
            body: JSON.stringify({ value })
        });
        await renderPage(); // Refresh the page
    } catch (error) {
        console.error('Error updating setting:', error);
    } finally {
        hideLoading();
    }
}
```

### Step 5: Update Initialization Function

```javascript
let centersCache = [];
let settingsCache = {};

async function init() {
    showLoading();

    try {
        // Fetch centers and settings
        centersCache = await fetchCenters();
        const settingsResponse = await fetchSettings();
        settingsCache = settingsResponse;

        // Populate center selector
        const centerSelect = document.getElementById('centerSelect');
        centersCache.forEach(center => {
            const option = document.createElement('option');
            option.value = center.id;
            option.textContent = center.name;
            centerSelect.appendChild(option);
        });

        // Populate student center select
        const studentCenterSelect = document.getElementById('studentCenter');
        centersCache.forEach(center => {
            const option = document.createElement('option');
            option.value = center.id;
            option.textContent = center.name;
            studentCenterSelect.appendChild(option);
        });

        // Setup event listeners
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', async () => {
                document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                currentPage = item.getAttribute('data-page');
                await renderPage();
            });
        });

        document.getElementById('centerSelect').addEventListener('change', async (e) => {
            selectedCenter = e.target.value;
            await renderPage();
        });

        const today = new Date().toISOString().split('T')[0];
        document.getElementById('billingDate').value = today;

        await renderPage();

    } catch (error) {
        console.error('Initialization error:', error);
        alert('Failed to initialize application. Please check backend connection.');
    } finally {
        hideLoading();
    }
}
```

### Step 6: Update Render Functions to Use Async/Await

```javascript
async function renderPage() {
    showLoading();
    const contentArea = document.getElementById('contentArea');

    try {
        switch(currentPage) {
            case 'dashboard':
                contentArea.innerHTML = await renderDashboard();
                break;
            case 'students':
                contentArea.innerHTML = await renderStudents();
                break;
            case 'billing':
                contentArea.innerHTML = await renderBilling();
                break;
            case 'settings':
                contentArea.innerHTML = await renderSettings();
                break;
        }
    } catch (error) {
        console.error('Error rendering page:', error);
        contentArea.innerHTML = `
            <div style="padding: 40px; text-align: center;">
                <h2>Error Loading Data</h2>
                <p>Please check your backend connection and try again.</p>
                <button class="btn" onclick="renderPage()">Retry</button>
            </div>
        `;
    } finally {
        hideLoading();
    }
}

async function renderDashboard() {
    const stats = await calculateGlobalStats();
    const centerStats = await calculateCenterStats();

    // ... rest of your renderDashboard code ...
}

async function renderStudents() {
    const students = await fetchStudents(selectedCenter);

    let studentsHTML = '';
    for (const student of students) {
        const arInfo = await fetchStudentAR(student.id);

        studentsHTML += `
            <tr>
                <td>${student.first_name} ${student.last_name}</td>
                <td>${student.age}</td>
                <td>${student.parent}</td>
                <td>${student.contact}</td>
                <td>${student.center_name}</td>
                <td class="amount">PHP ${formatMoney(student.tuition)}</td>
                <td>
                    ${arInfo.outstanding > 0 ?
                      `<span class="badge warning">PHP ${formatMoney(arInfo.outstanding)}</span>` :
                      `<span class="badge success">Paid</span>`
                    }
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn" onclick="editStudent(${student.id})">Edit</button>
                        <button class="action-btn delete" onclick="deleteStudent(${student.id})">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }

    return `
        <h1 class="page-title">Student Ledger</h1>
        <div class="table-container">
            <div class="table-header">
                <div class="table-title">Active Students (${students.length})</div>
                <div class="table-actions">
                    <input type="text" class="search-box" placeholder="Search students..." id="studentSearch" onkeyup="filterStudents()">
                    <button class="btn btn-small" onclick="openStudentModal()">Add Student</button>
                </div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Age</th>
                        <th>Parent/Guardian</th>
                        <th>Contact</th>
                        <th>Center</th>
                        <th>Monthly Tuition</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="studentsTableBody">
                    ${studentsHTML || '<tr><td colspan="8"><div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-text">No students found</div></div></td></tr>'}
                </tbody>
            </table>
        </div>
    `;
}

async function renderBilling() {
    const agingData = await fetchAgingReport(selectedCenter);
    const agingReport = agingData.data;

    let agingHTML = '';
    agingReport.forEach(item => {
        agingHTML += `
            <div class="aging-row warning">
                <div>
                    <strong>${item.studentName}</strong><br>
                    <span style="font-size: 12px; color: #666;">${item.centerName}</span>
                </div>
                <div class="amount">PHP ${formatMoney(item.totalOutstanding)}</div>
                <div class="amount">PHP ${formatMoney(item.current)}</div>
                <div class="amount">PHP ${formatMoney(item.days30)}</div>
                <div class="amount">PHP ${formatMoney(item.days60)}</div>
                <div class="amount">PHP ${formatMoney(item.days90Plus)}</div>
            </div>
        `;
    });

    return `
        <h1 class="page-title">Financial Dashboard</h1>
        <!-- ... rest of your billing HTML ... -->
    `;
}
```

### Step 7: Update Configuration for Production

When deploying to production, update the API_BASE_URL:

```javascript
// For production (after deploying backend to Railway/Render)
const API_BASE_URL = 'https://your-backend-url.railway.app/api';

// For development
// const API_BASE_URL = 'http://localhost:3000/api';
```

## 🧪 Testing the Integration

### 1. Start Backend
```bash
cd backend
npm run dev
```

### 2. Start Frontend
Use a local server (not just opening the HTML file):

```bash
# Using Python
python -m http.server 8080

# Or using Node.js http-server
npx http-server -p 8080
```

### 3. Open Browser
Navigate to `http://localhost:8080` and test:
- ✅ Dashboard loads with real data
- ✅ Student list displays
- ✅ Create new student
- ✅ Edit existing student
- ✅ Delete student
- ✅ Record payment
- ✅ View aging report

## 🐛 Common Issues

### CORS Errors
**Problem**: `Access to fetch... has been blocked by CORS policy`

**Solution**: Make sure your backend `.env` has correct FRONTEND_URL:
```env
FRONTEND_URL=http://localhost:8080
```

### API Connection Refused
**Problem**: `Failed to fetch` or `net::ERR_CONNECTION_REFUSED`

**Solution**:
- Ensure backend is running on port 3000
- Check API_BASE_URL in frontend matches backend URL

### Data Not Displaying
**Problem**: Page loads but shows no data

**Solution**:
- Check browser console for errors
- Verify backend API returns data: `curl http://localhost:3000/api/centers`
- Check network tab in browser dev tools

## 🚀 Next Steps

1. ✅ Complete frontend integration
2. ✅ Test all CRUD operations
3. ✅ Deploy backend to Railway/Render
4. ✅ Update frontend API_BASE_URL to production URL
5. ✅ Deploy frontend to GitHub Pages
6. ✅ Enable authentication (future enhancement)

## 📞 Need Help?

- Check backend logs for API errors
- Use browser dev tools → Network tab to debug API calls
- Review backend README for API documentation
- Test API endpoints with curl or Postman first
