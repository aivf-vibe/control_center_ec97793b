

// Sales Dashboard JavaScript
class SalesDashboard {
    constructor() {
        this.data = this.generateMockData();
        this.filteredData = [...this.data];
        this.charts = {};
        this.currentMetric = 'revenue';
        this.currentPieView = 'category';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadDashboard();
        this.hideLoading();
    }

    // Mock Data Generation
    generateMockData() {
        const categories = ['electronics', 'clothing', 'home', 'sports', 'books'];
        const regions = ['north', 'south', 'east', 'west', 'central'];
        const statuses = ['completed', 'pending', 'cancelled'];
        const names = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams', 'David Brown', 'Emma Davis', 'Chris Wilson', 'Lisa Anderson'];
        
        const data = [];
        const now = new Date();
        
        for (let i = 0; i < 500; i++) {
            const date = new Date(now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000);
            const amount = Math.floor(Math.random() * 5000) + 100;
            
            data.push({
                id: `ORD-${String(i + 1).padStart(4, '0')}`,
                date: date,
                customer: names[Math.floor(Math.random() * names.length)],
                category: categories[Math.floor(Math.random() * categories.length)],
                region: regions[Math.floor(Math.random() * regions.length)],
                amount: amount,
                status: statuses[Math.floor(Math.random() * statuses.length)],
                ageGroup: ['18-25', '26-35', '36-45', '46-55', '55+'][Math.floor(Math.random() * 5)]
            });
        }
        
        return data.sort((a, b) => b.date - a.date);
    }

    // Event Listeners
    setupEventListeners() {
        // Filter controls
        document.getElementById('categoryFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('regionFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('timeFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('clearFilters').addEventListener('click', () => this.clearFilters());
        document.getElementById('refreshData').addEventListener('click', () => this.refreshData());
        document.getElementById('exportData').addEventListener('click', () => this.exportData());

        // Chart controls
        document.querySelectorAll('[data-metric]').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchLineMetric(e.target.dataset.metric));
        });

        document.querySelectorAll('[data-pie]').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchPieView(e.target.dataset.pie));
        });
    }

    // Filter Functions
    applyFilters() {
        this.showLoading();
        
        const category = document.getElementById('categoryFilter').value;
        const region = document.getElementById('regionFilter').value;
        const days = parseInt(document.getElementById('timeFilter').value);
        
        this.filteredData = this.data.filter(item => {
            const categoryMatch = category === 'all' || item.category === category;
            const regionMatch = region === 'all' || item.region === region;
            const dateMatch = (new Date() - item.date) <= (days * 24 * 60 * 60 * 1000);
            
            return categoryMatch && regionMatch && dateMatch;
        });

        this.updateDashboard();
        this.hideLoading();
    }

    clearFilters() {
        document.getElementById('categoryFilter').value = 'all';
        document.getElementById('regionFilter').value = 'all';
        document.getElementById('timeFilter').value = '30';
        this.filteredData = [...this.data];
        this.updateDashboard();
    }

    // Dashboard Updates
    updateDashboard() {
        this.updateKPIs();
        this.updateCharts();
        this.updateTable();
    }

    updateKPIs() {
        const completedOrders = this.filteredData.filter(item => item.status === 'completed');
        const totalRevenue = completedOrders.reduce((sum, item) => sum + item.amount, 0);
        const totalOrders = this.filteredData.length;
        const uniqueCustomers = new Set(this.filteredData.map(item => item.customer)).size;
        const conversionRate = totalOrders > 0 ? (completedOrders.length / totalOrders * 100) : 0;

        // Calculate changes (mock data for demo)
        const revenueChange = Math.floor(Math.random() * 40) - 10;
        const ordersChange = Math.floor(Math.random() * 30) - 5;
        const customersChange = Math.floor(Math.random() * 25) - 5;
        const conversionChange = Math.floor(Math.random() * 20) - 5;

        document.getElementById('totalRevenue').textContent = `$${totalRevenue.toLocaleString()}`;
        document.getElementById('totalOrders').textContent = totalOrders.toLocaleString();
        document.getElementById('activeCustomers').textContent = uniqueCustomers.toLocaleString();
        document.getElementById('conversionRate').textContent = `${conversionRate.toFixed(1)}%`;

        this.updateKPIChange('revenueChange', revenueChange);
        this.updateKPIChange('ordersChange', ordersChange);
        this.updateKPIChange('customersChange', customersChange);
        this.updateKPIChange('conversionChange', conversionChange);
    }

    updateKPIChange(elementId, change) {
        const element = document.getElementById(elementId);
        element.textContent = `${change >= 0 ? '+' : ''}${change}%`;
        element.className = `kpi-change ${change >= 0 ? 'positive' : 'negative'}`;
    }

    // Chart Functions
    updateCharts() {
        this.updateLineChart();
        this.updatePieChart();
    }

    updateLineChart() {
        const ctx = document.getElementById('salesTrendChart').getContext('2d');
        
        if (this.charts.line) {
            this.charts.line.destroy();
        }

        const monthlyData = this.aggregateMonthlyData();
        const labels = monthlyData.map(d => d.month);
        const data = monthlyData.map(d => d[this.currentMetric]);

        this.charts.line = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: this.currentMetric.charAt(0).toUpperCase() + this.currentMetric.slice(1),
                    data: data,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#2563eb',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#e2e8f0'
                        },
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString();
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    updatePieChart() {
        const ctx = document.getElementById('demographicsChart').getContext('2d');
        
        if (this.charts.pie) {
            this.charts.pie.destroy();
        }

        const data = this.aggregatePieData();
        const labels = Object.keys(data);
        const values = Object.values(data);

        const colors = [
            '#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
            '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
        ];

        this.charts.pie = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors.slice(0, labels.length),
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }

    // Data Aggregation
    aggregateMonthlyData() {
        const monthlyMap = new Map();
        const completedOrders = this.filteredData.filter(item => item.status === 'completed');
        
        completedOrders.forEach(order => {
            const month = order.date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
            if (!monthlyMap.has(month)) {
                monthlyMap.set(month, { month, revenue: 0, orders: 0, customers: new Set() });
            }
            
            const data = monthlyMap.get(month);
            data.revenue += order.amount;
            data.orders += 1;
            data.customers.add(order.customer);
        });

        return Array.from(monthlyMap.values())
            .map(d => ({ ...d, customers: d.customers.size }))
            .sort((a, b) => new Date(a.month) - new Date(b.month));
    }

    aggregatePieData() {
        const data = {};
        const completedOrders = this.filteredData.filter(item => item.status === 'completed');
        
        completedOrders.forEach(order => {
            const key = order[this.currentPieView];
            data[key] = (data[key] || 0) + order.amount;
        });

        return data;
    }

    // Chart Switching
    switchLineMetric(metric) {
        this.currentMetric = metric;
        document.querySelectorAll('[data-metric]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.metric === metric);
        });
        this.updateLineChart();
    }

    switchPieView(view) {
        this.currentPieView = view;
        document.querySelectorAll('[data-pie]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.pie === view);
        });
        this.updatePieChart();
    }

    // Table Functions
    updateTable() {
        const tbody = document.getElementById('salesTableBody');
        const recentOrders = this.filteredData.slice(0, 10);
        
        tbody.innerHTML = recentOrders.map(order => `
            <tr>
                <td>${order.id}</td>
                <td>${order.date.toLocaleDateString()}</td>
                <td>${order.customer}</td>
                <td>${order.category.charAt(0).toUpperCase() + order.category.slice(1)}</td>
                <td>${order.region.charAt(0).toUpperCase() + order.region.slice(1)}</td>
                <td>$${order.amount.toLocaleString()}</td>
                <td><span class="status-badge status-${order.status}">${order.status}</span></td>
            </tr>
        `).join('');
    }

    // Utility Functions
    showLoading() {
        document.getElementById('loadingOverlay').classList.add('active');
    }

    hideLoading() {
        document.getElementById('loadingOverlay').classList.remove('active');
    }

    refreshData() {
        this.showLoading();
        setTimeout(() => {
            this.data = this.generateMockData();
            this.applyFilters();
            this.hideLoading();
        }, 1000);
    }

    exportData() {
        const csv = this.convertToCSV(this.filteredData);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sales-data-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    convertToCSV(data) {
        const headers = ['Order ID', 'Date', 'Customer', 'Category', 'Region', 'Amount', 'Status'];
        const rows = data.map(item => [
            item.id,
            item.date.toLocaleDateString(),
            item.customer,
            item.category,
            item.region,
            item.amount,
            item.status
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    loadDashboard() {
        this.updateDashboard();
    }
}

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    new SalesDashboard();
});

// Security Features
(function() {
    'use strict';
    
    // Prevent XSS
    const escapeHtml = (unsafe) => {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    // Content Security Policy
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:;";
    document.head.appendChild(meta);

    // Input validation
    const sanitizeInput = (input) => {
        return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    };

    // Apply sanitization to all inputs
    document.addEventListener('input', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            e.target.value = sanitizeInput(e.target.value);
        }
    });
})();

