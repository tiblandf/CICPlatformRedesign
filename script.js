// Application state
let currentUser = null;
let sidebarCollapsed = false;
let budgetChart = null;

// Sample user data with personas
const users = {
    'scenario': {
        username: 'scenario',
        password: 'scenario123',
        persona: 'scenario',
        displayName: 'Scenario Owner',
        permissions: ['all']
    },
    'cogs': {
        username: 'cogs',
        password: 'cogs123',
        persona: 'cogs',
        displayName: 'COGS Champ',
        permissions: ['view-costs', 'manage-budgets']
    },
    'gem': {
        username: 'gem',
        password: 'gem123',
        persona: 'gem',
        displayName: 'GEM',
        permissions: ['view-costs']
    }
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const loginForm = document.getElementById('loginForm');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const userGreeting = document.getElementById('userGreeting');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginSection = document.getElementById('loginSection');
    const userSection = document.getElementById('userSection');
    const loginPrompt = document.getElementById('loginPrompt');
    const dashboardContent = document.getElementById('dashboardContent');

    // Copilot elements
    const copilotBtn = document.getElementById('copilotBtn');
    const copilotPanel = document.getElementById('copilotPanel');
    const closeCopilot = document.getElementById('closeCopilot');

    // Always show login page first
    showLogin();

    // Event listeners
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Quick login role cards
    const roleCards = document.querySelectorAll('.role-card');
    roleCards.forEach(card => {
        const button = card.querySelector('.role-login-btn');
        if (button) {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const role = card.getAttribute('data-role');
                quickLogin(role);
            });
        }
    });
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    const expandBtn = document.getElementById('expandBtn');
    if (expandBtn) {
        expandBtn.addEventListener('click', toggleSidebar);
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Home link functionality
    const homeLink = document.getElementById('homeLink');
    if (homeLink) {
        homeLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (currentUser) {
                // Remove active class from all nav items
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.remove('active');
                });
                // Add active class to home page nav item
                const homeNavItem = document.querySelector('.nav-item[data-page="dashboard"]');
                if (homeNavItem) {
                    homeNavItem.classList.add('active');
                }
                showDashboard();
            }
        });
    }

    // Copilot panel toggle
    if (copilotBtn) {
        copilotBtn.addEventListener('click', function() {
            copilotPanel.classList.toggle('active');
        });
    }

    if (closeCopilot) {
        closeCopilot.addEventListener('click', function() {
            copilotPanel.classList.remove('active');
        });
    }

    // Copilot input handler
    const copilotInput = document.querySelector('.copilot-input');
    if (copilotInput) {
        copilotInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && this.value.trim() !== '') {
                e.preventDefault();
                const userMessage = this.value.trim();
                this.value = '';
                
                // Add user message
                const copilotContent = document.querySelector('.copilot-content');
                const messageDiv = document.createElement('div');
                messageDiv.style.cssText = 'background: #f3f2f1; padding: 12px; border-radius: 8px; margin-bottom: 12px; font-size: 14px;';
                messageDiv.textContent = userMessage;
                copilotContent.insertBefore(messageDiv, copilotContent.querySelector('.copilot-input-container'));
                
                // Add mock response
                setTimeout(() => {
                    const responseDiv = document.createElement('div');
                    responseDiv.style.cssText = 'background: #e1f3ff; padding: 12px; border-radius: 8px; margin-bottom: 12px; font-size: 14px; color: #323130;';
                    responseDiv.textContent = 'This is just a mock.';
                    copilotContent.insertBefore(responseDiv, copilotContent.querySelector('.copilot-input-container'));
                    copilotContent.scrollTop = copilotContent.scrollHeight;
                }, 500);
            }
        });
    }

    // View All Insights button
    const viewAllInsightsBtn = document.getElementById('viewAllInsightsBtn');
    if (viewAllInsightsBtn) {
        viewAllInsightsBtn.addEventListener('click', function() {
            // Update navigation
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            const insightsNavItem = document.querySelector('.nav-item[data-page="insights"]');
            if (insightsNavItem) {
                insightsNavItem.classList.add('active');
            }
            showInsightsPortal();
        });
    }

    // View All Anomalies button (goes to Insights Portal - Anomalies tab)
    const viewAllAnomaliesBtn = document.getElementById('viewAllAnomaliesBtn');
    if (viewAllAnomaliesBtn) {
        viewAllAnomaliesBtn.addEventListener('click', function() {
            // Update navigation
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            const insightsNavItem = document.querySelector('.nav-item[data-page="insights"]');
            if (insightsNavItem) {
                insightsNavItem.classList.add('active');
            }
            showInsightsPortal();
            // Switch to anomalies tab
            setTimeout(() => {
                const anomaliesTab = document.querySelector('.tab-btn[data-tab="anomalies"]');
                if (anomaliesTab) {
                    anomaliesTab.click();
                }
            }, 100);
        });
    }

    // Landing page Insights/Anomalies toggle
    const landingToggleBtns = document.querySelectorAll('.landing-toggle-btn');
    landingToggleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const toggleType = this.getAttribute('data-toggle');
            switchLandingInsightsView(toggleType);
        });
    });

    // Efficiency Projects item click handlers
    const efficiencyItems = document.querySelectorAll('.efficiency-item[data-efficiency-page]');
    efficiencyItems.forEach(item => {
        item.addEventListener('click', function() {
            const pageType = this.getAttribute('data-efficiency-page');
            if (pageType === 'efficiency-virtualized') {
                showEfficiencyVirtualized();
            } else if (pageType === 'efficiency-baremetal') {
                showEfficiencyBaremetal();
            } else if (pageType === 'efficiency-bigbets') {
                showEfficiencyBigbets();
            }
        });
    });

    // Metric card navigation
    const metricCards = document.querySelectorAll('.metric-card');
    metricCards.forEach(card => {
        card.addEventListener('click', function() {
            const scrollTarget = this.getAttribute('data-scroll');
            const navigation = this.getAttribute('data-navigation');
            
            // Priority 1: If there's a scroll target, scroll to it on the same page
            if (scrollTarget) {
                const targetElement = document.getElementById(scrollTarget);
                if (targetElement) {
                    // Switch the toggle based on navigation type before scrolling
                    if (navigation === 'insights-savings') {
                        switchLandingInsightsView('insights');
                    } else if (navigation === 'insights-anomalies') {
                        switchLandingInsightsView('anomalies');
                    }
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                return; // Don't navigate to another page
            }
            
            // Priority 2: Handle navigation to other pages only if no scroll target
            if (navigation === 'insights-savings') {
                // Go to Insights Portal - Potential Savings tab
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.remove('active');
                });
                const insightsNavItem = document.querySelector('.nav-item[data-page="insights"]');
                if (insightsNavItem) {
                    insightsNavItem.classList.add('active');
                }
                showInsightsPortal();
                // Switch to savings tab
                setTimeout(() => {
                    const savingsTab = document.querySelector('.tab-btn[data-tab="savings"]');
                    if (savingsTab) {
                        savingsTab.click();
                    }
                }, 100);
            } else if (navigation === 'insights-anomalies') {
                // Go to Insights Portal - Anomalies tab
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.remove('active');
                });
                const insightsNavItem = document.querySelector('.nav-item[data-page="insights"]');
                if (insightsNavItem) {
                    insightsNavItem.classList.add('active');
                }
                showInsightsPortal();
                // Anomalies tab is already default, but ensure it's active
                setTimeout(() => {
                    const anomaliesTab = document.querySelector('.tab-btn[data-tab="anomalies"]');
                    if (anomaliesTab) {
                        anomaliesTab.click();
                    }
                }, 100);
            } else if (navigation === 'finops') {
                // Go to FinOps page
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.remove('active');
                });
                const finopsNavItem = document.querySelector('.nav-item[data-page="finops"]');
                if (finopsNavItem) {
                    finopsNavItem.classList.add('active');
                }
                showFinOps();
            }
        });
    });

    // Show Details button for FinOps chart
    const showFinOpsDetailsBtn = document.getElementById('showFinOpsDetailsBtn');
    if (showFinOpsDetailsBtn) {
        showFinOpsDetailsBtn.addEventListener('click', function() {
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            const finopsNavItem = document.querySelector('.nav-item[data-page="finops"]');
            if (finopsNavItem) {
                finopsNavItem.classList.add('active');
            }
            showFinOps();
        });
    }

    // Insight cards flyout
    const insightCards = document.querySelectorAll('.insight-card[data-insight]');
    const insightFlyout = document.getElementById('insightFlyout');
    const closeFlyout = document.getElementById('closeFlyout');
    const flyoutTitle = document.getElementById('flyoutTitle');
    const flyoutBody = document.getElementById('flyoutBody');

    const insightDetails = {
        anomaly1: {
            type: 'anomaly',
            title: '$36.86M Monthly Automation Cost Increase',
            status: 'New',
            startDate: '2025-07-03',
            serviceName: 'IPSubstrate*',
            workloadName: 'SIPIGriffitProccessorDipPolicyChangeCrawlerAssistant',
            impactedResource: 'Transaction (TRU)',
            description: 'We detected an increase in your workload since 07/03/2025. To investigate, please follow the recommendations below.',
            breakdownBy: 'Cost',
            chartDescription: 'Increase in Transaction (TRU) since 07/03/25',
            recommendation: 'Determine whether this increase aligns with your expectation, and fix the unexpected increase. Visit below TSG to resolve it quickly!',
            tsgLink: 'https://aka.ms/StoreCPUAnomaly',
            takeAction: 'Acknowledge, Mitigate, and Resolve through ICM.\n\nUpdate the Status of the anomalies ICM to close this anomaly.'
        },
        insight1: {
            type: 'insight',
            title: '$15.6M Monthly Saving Opportunity',
            status: 'Active',
            startDate: '2025-11-15',
            serviceName: 'Azure Compute',
            workloadName: 'Production Workloads',
            impactedResource: 'Virtual Machines',
            description: 'Analysis has identified significant cost reduction opportunities through resource optimization and consolidation across multiple services.',
            breakdownBy: 'Potential Savings',
            chartDescription: 'Optimization Opportunities Identified',
            recommendation: 'Consolidate underutilized resources, migrate to reserved instances, and implement auto-scaling policies. Focus on compute resources with <20% utilization.',
            tsgLink: 'https://aka.ms/AzureOptimization',
            takeAction: 'Review and apply recommended optimizations.\n\nSchedule implementation during next maintenance window.'
        },
        anomaly2: {
            type: 'anomaly',
            title: 'Unexpected Spike in Storage Costs',
            status: 'New',
            startDate: '2025-12-05',
            serviceName: 'Azure Storage',
            workloadName: 'HDD-Storage',
            impactedResource: 'Storage Capacity',
            description: 'We detected an increase in your workload since 12/05/2025. Storage costs have increased by 180% over the past week.',
            breakdownBy: 'Storage Growth',
            chartDescription: 'Increase in HDD Storage since 12/05/25',
            recommendation: 'Review data retention policies, identify and archive cold data, and migrate appropriate workloads to lower-cost storage tiers.',
            tsgLink: 'https://aka.ms/StorageOptimization',
            takeAction: 'Investigate storage growth patterns.\n\nImplement data lifecycle management policies.'
        },
        insight2: {
            type: 'insight',
            title: 'Right-size 16 Over-provisioned Instances',
            status: 'Recommended',
            startDate: '2025-11-28',
            serviceName: 'Azure Compute',
            workloadName: 'Production VMs',
            impactedResource: 'Virtual Machines (D-Series)',
            description: 'Machine learning analysis has identified 16 compute instances that are consistently over-provisioned, running at less than 15% average utilization.',
            breakdownBy: 'Instance Size',
            chartDescription: 'Over-provisioned Instances Detected',
            recommendation: 'Downsize instances during next maintenance window. No performance impact expected based on historical usage patterns.',
            tsgLink: 'https://aka.ms/VMRightSizing',
            takeAction: 'Review recommended instance sizes.\n\nApply changes during scheduled maintenance.'
        },
        insight3: {
            type: 'insight',
            title: 'Consolidate 8 Underutilized Databases',
            status: 'Recommended',
            startDate: '2025-12-01',
            serviceName: 'Azure SQL',
            workloadName: 'Development Databases',
            impactedResource: 'SQL Databases',
            description: 'Analysis shows 8 databases with less than 10% utilization that could be consolidated into elastic pools for significant savings.',
            breakdownBy: 'Database Usage',
            chartDescription: 'Underutilized Databases Identified',
            recommendation: 'Migrate identified databases to elastic pools during off-peak hours. Estimated savings of $2.3M annually.',
            tsgLink: 'https://aka.ms/SQLElasticPools',
            takeAction: 'Review database consolidation plan.\n\nSchedule migration during maintenance window.'
        },
        insight4: {
            type: 'insight',
            title: 'Optimize Reserved Instance Coverage',
            status: 'Active',
            startDate: '2025-11-20',
            serviceName: 'Azure Reservations',
            workloadName: 'All Workloads',
            impactedResource: 'Reserved Instances',
            description: 'Current reserved instance coverage is at 45%. Increasing coverage to 70% would save approximately $1.8M annually.',
            breakdownBy: 'Coverage Type',
            chartDescription: 'Reserved Instance Coverage Gap',
            recommendation: 'Purchase additional 1-year reservations for stable workloads. Focus on D-series and E-series VMs.',
            tsgLink: 'https://aka.ms/AzureReservations',
            takeAction: 'Review reservation recommendations.\n\nSubmit purchase request for approval.'
        },
        anomaly3: {
            type: 'anomaly',
            title: 'Network Traffic Surge Detected',
            status: 'New',
            startDate: '2025-12-08',
            serviceName: 'Azure Network',
            workloadName: 'External API Gateway',
            impactedResource: 'Network Egress',
            description: 'We detected a 340% increase in network egress traffic since 12/08/2025. This is causing unexpected bandwidth charges.',
            breakdownBy: 'Traffic Volume',
            chartDescription: 'Increase in Network Egress since 12/08/25',
            recommendation: 'Investigate API clients for unusual activity. Consider implementing caching or CDN to reduce egress costs.',
            tsgLink: 'https://aka.ms/NetworkOptimization',
            takeAction: 'Analyze network traffic patterns.\n\nImplement traffic management controls.'
        },
        anomaly4: {
            type: 'anomaly',
            title: 'CPU Usage Spike in Substrate',
            status: 'Investigating',
            startDate: '2025-12-10',
            serviceName: 'Substrate Compute',
            workloadName: 'Background Processing',
            impactedResource: 'CPU Cores',
            description: 'CPU utilization on Substrate compute has increased by 85% since 12/10/2025. Root cause analysis in progress.',
            breakdownBy: 'CPU Usage',
            chartDescription: 'Increase in CPU Usage since 12/10/25',
            recommendation: 'Review recent deployments and configuration changes. Check for runaway processes or inefficient queries.',
            tsgLink: 'https://aka.ms/SubstratePerformance',
            takeAction: 'Review CPU utilization metrics.\n\nIdentify and optimize high-consumption processes.'
        }
    };

    insightCards.forEach(card => {
        card.addEventListener('click', function() {
            const insightId = this.getAttribute('data-insight');
            const insight = insightDetails[insightId];
            
            if (insight) {
                showInsightFlyout(insight);
            }
        });
    });

    if (closeFlyout) {
        closeFlyout.addEventListener('click', hideInsightFlyout);
    }

    function showInsightFlyout(insight) {
        flyoutTitle.textContent = 'Insight Details';
        
        let bodyHTML = `
            <div class="flyout-info-grid">
                <div class="flyout-info-item">
                    <div class="flyout-info-label">Status</div>
                    <div class="flyout-info-value">${insight.status}</div>
                </div>
                <div class="flyout-info-item">
                    <div class="flyout-info-label">${insight.type === 'anomaly' ? 'Anomaly Start Date' : 'Recommendation Date'}</div>
                    <div class="flyout-info-value">${insight.startDate}</div>
                </div>
                <div class="flyout-info-item">
                    <div class="flyout-info-label">Service Name</div>
                    <div class="flyout-info-value">${insight.serviceName}</div>
                </div>
                <div class="flyout-info-item">
                    <div class="flyout-info-label">Impacted Resource</div>
                    <div class="flyout-info-value">${insight.impactedResource}</div>
                </div>
                <div class="flyout-info-item full-width">
                    <div class="flyout-info-label">WorkloadName</div>
                    <div class="flyout-info-value">${insight.workloadName}</div>
                </div>
            </div>
            
            <div class="flyout-divider"></div>
            
            <div class="flyout-section">
                <h4>Details</h4>
                <div class="flyout-details-text">${insight.chartDescription}</div>
                <p>${insight.description}</p>
                <div class="flyout-breakdown">
                    <strong>Breakdown by:</strong> ${insight.breakdownBy} <i class="fas fa-chevron-down"></i>
                </div>
                <div class="flyout-chart-container">
                    <canvas id="flyoutChart"></canvas>
                </div>
            </div>
            
            <div class="flyout-divider"></div>
            
            <div class="flyout-section">
                <h4>Recommendation</h4>
                <p>${insight.recommendation}</p>
                ${insight.tsgLink ? `<div class="flyout-link">Store CPU Anomaly TSG: <a href="${insight.tsgLink}" target="_blank">${insight.tsgLink}</a></div>` : ''}
            </div>
            
            <div class="flyout-divider"></div>
            
            <div class="flyout-section">
                <h4>Take Action</h4>
                <p style="white-space: pre-line;">${insight.takeAction}</p>
                <button class="flyout-action-btn primary-btn">${insight.type === 'anomaly' ? 'Resolve in IcM' : 'Apply Recommendation'}</button>
                <button class="flyout-action-btn secondary-btn">Close</button>
            </div>
        `;
        
        flyoutBody.innerHTML = bodyHTML;
        insightFlyout.classList.add('active');
        
        // Render the chart with specific data for this insight
        setTimeout(() => renderFlyoutChart(insight), 100);
        
        // Add click handler for secondary button
        const secondaryBtn = flyoutBody.querySelector('.secondary-btn');
        if (secondaryBtn) {
            secondaryBtn.addEventListener('click', hideInsightFlyout);
        }
    }

    function hideInsightFlyout() {
        insightFlyout.classList.remove('active');
        
        // Destroy chart instance if exists
        if (window.flyoutChartInstance) {
            window.flyoutChartInstance.destroy();
            window.flyoutChartInstance = null;
        }
    }
    
    function renderFlyoutChart(insight) {
        const canvas = document.getElementById('flyoutChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Destroy previous chart instance if exists
        if (window.flyoutChartInstance) {
            window.flyoutChartInstance.destroy();
        }
        
        // Vary chart data based on insight type and title
        let labels, actualData, expectedData, actualLabel, expectedLabel, actualColor, expectedColor;
        
        if (insight && insight.title && insight.title.includes('$36.86M')) {
            // Anomaly 1 - Sharp increase
            labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'];
            actualData = [12000, 13500, 14200, 15800, 16500, 18200, 19500, 21000];
            expectedData = [12000, 12500, 13000, 13500, 14000, 14500, 15000, 15500];
            actualLabel = 'Actual Cost';
            expectedLabel = 'Expected Cost';
            actualColor = '#d13438';
            expectedColor = '#0078d4';
        } else if (insight && insight.title && insight.title.includes('$15.6M')) {
            // Insight 1 - Savings opportunity
            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
            actualData = [45000, 46500, 47800, 48200, 49100, 50200, 51500, 52800];
            expectedData = [45000, 43500, 42000, 40500, 39000, 37500, 36000, 34500];
            actualLabel = 'Current Spend';
            expectedLabel = 'Optimized Spend';
            actualColor = '#ff6b6b';
            expectedColor = '#107c10';
        } else if (insight && insight.title && insight.title.includes('Storage')) {
            // Anomaly 2 - Gradual increase
            labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Today'];
            actualData = [8000, 8200, 8500, 9100, 9800, 10200, 10800, 11500];
            expectedData = [8000, 8100, 8200, 8300, 8400, 8500, 8600, 8700];
            actualLabel = 'Storage Usage';
            expectedLabel = 'Baseline';
            actualColor = '#f7630c';
            expectedColor = '#0078d4';
        } else {
            // Insight 2 - Reserved instance savings
            labels = ['Q1', 'Q2', 'Q3', 'Q4'];
            actualData = [180000, 185000, 190000, 195000];
            expectedData = [180000, 175000, 170000, 165000];
            actualLabel = 'Pay-as-you-go';
            expectedLabel = 'Reserved Instance';
            actualColor = '#d83b01';
            expectedColor = '#0078d4';
        }
        
        window.flyoutChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: actualLabel,
                        data: actualData,
                        borderColor: actualColor,
                        backgroundColor: actualColor + '1A',
                        borderWidth: 2,
                        tension: 0.3,
                        pointRadius: 4,
                        pointBackgroundColor: actualColor,
                        fill: true
                    },
                    {
                        label: expectedLabel,
                        data: expectedData,
                        borderColor: expectedColor,
                        backgroundColor: 'rgba(0, 120, 212, 0.05)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        tension: 0.3,
                        pointRadius: 4,
                        pointBackgroundColor: expectedColor,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 15,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': $' + context.parsed.y.toLocaleString();
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return '$' + (value / 1000) + 'K';
                            },
                            font: {
                                size: 11
                            }
                        },
                        grid: {
                            color: '#f0f0f0'
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                size: 11
                            }
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    // Login functionality
    function handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Find user by username and password
        const user = Object.values(users).find(u => 
            u.username === username && 
            u.password === password
        );
        
        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            showDashboard();
        } else {
            alert('Invalid credentials. Please try again.');
        }
    }

    // Quick login function for role cards
    function quickLogin(role) {
        const user = users[role];
        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            showDashboard();
        }
    }

    // Switch between Actionable Insights and Anomalies view on landing page
    function switchLandingInsightsView(viewType) {
        const insightsBtn = document.getElementById('landingInsightsToggle');
        const anomaliesBtn = document.getElementById('landingAnomaliesToggle');
        const insightsContent = document.getElementById('landingInsightsContent');
        const anomaliesContent = document.getElementById('landingAnomaliesContent');
        
        if (!insightsBtn || !anomaliesBtn || !insightsContent || !anomaliesContent) return;
        
        // Remove active from all toggle buttons and content
        insightsBtn.classList.remove('active');
        anomaliesBtn.classList.remove('active');
        insightsContent.classList.remove('active');
        anomaliesContent.classList.remove('active');
        
        // Activate the selected view
        if (viewType === 'anomalies') {
            anomaliesBtn.classList.add('active');
            anomaliesContent.classList.add('active');
        } else {
            insightsBtn.classList.add('active');
            insightsContent.classList.add('active');
        }
    }

    // Show dashboard after successful login
    function showDashboard() {
        if (loginSection) loginSection.classList.add('hidden');
        if (userSection) userSection.classList.remove('hidden');
        if (loginPrompt) loginPrompt.classList.add('hidden');
        
        // Hide all content areas
        hideAllContentAreas();
        
        // Show dashboard content
        if (dashboardContent) dashboardContent.classList.remove('hidden');
        
        // Update user greeting
        if (userGreeting) {
            userGreeting.textContent = currentUser.displayName;
        }
        
        // Initialize charts
        setTimeout(() => {
            initializeCharts();
        }, 100);
        
        // Apply persona-specific customizations
        applyPersonaCustomizations();
    }

    // Show Insights Portal
    function showInsightsPortal() {
        // Ensure user is logged in
        if (!currentUser) {
            showLogin();
            return;
        }
        
        if (loginSection) loginSection.classList.add('hidden');
        if (userSection) userSection.classList.remove('hidden');
        if (loginPrompt) loginPrompt.classList.add('hidden');
        
        // Hide all content areas
        hideAllContentAreas();
        
        // Show insights portal content
        const insightsPortalContent = document.getElementById('insightsPortalContent');
        if (insightsPortalContent) insightsPortalContent.classList.remove('hidden');
        
        // Initialize tab functionality
        initializeInsightsTabs();
    }

    // Initialize Insights Portal tab functionality
    function initializeInsightsTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const targetTab = this.getAttribute('data-tab');
                
                // Remove active class from all tabs and content
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Show corresponding content
                const targetContent = document.getElementById(targetTab + '-content');
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }



    // Show FinOps page
    function showFinOps() {
        // Ensure user is logged in
        if (!currentUser) {
            showLogin();
            return;
        }
        
        if (loginSection) loginSection.classList.add('hidden');
        if (userSection) userSection.classList.remove('hidden');
        if (loginPrompt) loginPrompt.classList.add('hidden');
        
        // Hide all content areas
        hideAllContentAreas();
        
        // Show FinOps content
        const finOpsContent = document.getElementById('finopsContent');
        if (finOpsContent) finOpsContent.classList.remove('hidden');
        
        // Initialize FinOps filters
        initializeFinOpsFilters();
    }

    // Show Virtualized Efficiency Tracker page
    function showEfficiencyVirtualized() {
        // Ensure user is logged in
        if (!currentUser) {
            showLogin();
            return;
        }
        
        if (loginSection) loginSection.classList.add('hidden');
        if (userSection) userSection.classList.remove('hidden');
        if (loginPrompt) loginPrompt.classList.add('hidden');
        
        // Hide all content areas
        hideAllContentAreas();
        
        // Show Virtualized Efficiency Tracker content
        const efficiencyContent = document.getElementById('efficiencyVirtualizedContent');
        if (efficiencyContent) efficiencyContent.classList.remove('hidden');
    }

    // Show Baremetal Efficiency Tracker page
    function showEfficiencyBaremetal() {
        // Ensure user is logged in
        if (!currentUser) {
            showLogin();
            return;
        }
        
        if (loginSection) loginSection.classList.add('hidden');
        if (userSection) userSection.classList.remove('hidden');
        if (loginPrompt) loginPrompt.classList.add('hidden');
        
        // Hide all content areas
        hideAllContentAreas();
        
        // Show Baremetal Efficiency Tracker content
        const efficiencyContent = document.getElementById('efficiencyBaremetalContent');
        if (efficiencyContent) efficiencyContent.classList.remove('hidden');
    }

    // Show Big Bets Efficiency Tracker page
    function showEfficiencyBigbets() {
        // Ensure user is logged in
        if (!currentUser) {
            showLogin();
            return;
        }
        
        if (loginSection) loginSection.classList.add('hidden');
        if (userSection) userSection.classList.remove('hidden');
        if (loginPrompt) loginPrompt.classList.add('hidden');
        
        // Hide all content areas
        hideAllContentAreas();
        
        // Show Big Bets Efficiency Tracker content
        const efficiencyContent = document.getElementById('efficiencyBigbetsContent');
        if (efficiencyContent) efficiencyContent.classList.remove('hidden');
    }

    // Show Substrate page
    function showSubstrate() {
        // Ensure user is logged in
        if (!currentUser) {
            showLogin();
            return;
        }
        
        if (loginSection) loginSection.classList.add('hidden');
        if (userSection) userSection.classList.remove('hidden');
        if (loginPrompt) loginPrompt.classList.add('hidden');
        
        // Hide all content areas
        hideAllContentAreas();
        
        // Show Substrate content
        const substrateContent = document.getElementById('substrateContent');
        if (substrateContent) {
            substrateContent.classList.remove('hidden');
            // Initialize charts
            setTimeout(() => {
                initializeSubstrateCharts();
            }, 100);
        }
    }

    // Show Azure page
    function showAzure() {
        // Ensure user is logged in
        if (!currentUser) {
            showLogin();
            return;
        }
        
        if (loginSection) loginSection.classList.add('hidden');
        if (userSection) userSection.classList.remove('hidden');
        if (loginPrompt) loginPrompt.classList.add('hidden');
        
        // Hide all content areas
        hideAllContentAreas();
        
        // Show Azure content
        const azureContent = document.getElementById('azureContent');
        if (azureContent) {
            azureContent.classList.remove('hidden');
            // Initialize charts
            setTimeout(() => {
                initializeAzureCharts();
            }, 100);
        }
    }

    // Show COSMIC page
    function showCosmic() {
        // Ensure user is logged in
        if (!currentUser) {
            showLogin();
            return;
        }
        
        if (loginSection) loginSection.classList.add('hidden');
        if (userSection) userSection.classList.remove('hidden');
        if (loginPrompt) loginPrompt.classList.add('hidden');
        
        // Hide all content areas
        hideAllContentAreas();
        
        // Show COSMIC content
        const cosmicContent = document.getElementById('cosmicContent');
        if (cosmicContent) {
            cosmicContent.classList.remove('hidden');
            // Initialize charts
            setTimeout(() => {
                initializeCosmicCharts();
            }, 100);
        }
    }

    // Show Telemetry page
    function showTelemetry() {
        // Ensure user is logged in
        if (!currentUser) {
            showLogin();
            return;
        }
        
        if (loginSection) loginSection.classList.add('hidden');
        if (userSection) userSection.classList.remove('hidden');
        if (loginPrompt) loginPrompt.classList.add('hidden');
        
        // Hide all content areas
        hideAllContentAreas();
        
        // Show Telemetry content
        const telemetryContent = document.getElementById('telemetryContent');
        if (telemetryContent) {
            telemetryContent.classList.remove('hidden');
            // Initialize charts
            setTimeout(() => {
                initializeTelemetryCharts();
            }, 100);
        }
    }

    // Hide all content areas
    function hideAllContentAreas() {
        if (dashboardContent) dashboardContent.classList.add('hidden');
        const insightsPortalContent = document.getElementById('insightsPortalContent');
        if (insightsPortalContent) insightsPortalContent.classList.add('hidden');
        const finOpsContent = document.getElementById('finopsContent');
        if (finOpsContent) finOpsContent.classList.add('hidden');
        const efficiencyVirtualizedContent = document.getElementById('efficiencyVirtualizedContent');
        if (efficiencyVirtualizedContent) efficiencyVirtualizedContent.classList.add('hidden');
        const efficiencyBaremetalContent = document.getElementById('efficiencyBaremetalContent');
        if (efficiencyBaremetalContent) efficiencyBaremetalContent.classList.add('hidden');
        const efficiencyBigbetsContent = document.getElementById('efficiencyBigbetsContent');
        if (efficiencyBigbetsContent) efficiencyBigbetsContent.classList.add('hidden');
        const substrateContent = document.getElementById('substrateContent');
        if (substrateContent) substrateContent.classList.add('hidden');
        const azureContent = document.getElementById('azureContent');
        if (azureContent) azureContent.classList.add('hidden');
        const cosmicContent = document.getElementById('cosmicContent');
        if (cosmicContent) cosmicContent.classList.add('hidden');
        const telemetryContent = document.getElementById('telemetryContent');
        if (telemetryContent) telemetryContent.classList.add('hidden');
    }

    // Hide dashboard and show login
    function showLogin() {
        if (loginSection) loginSection.classList.remove('hidden');
        if (userSection) userSection.classList.add('hidden');
        if (loginPrompt) loginPrompt.classList.remove('hidden');
        if (dashboardContent) dashboardContent.classList.add('hidden');
        
        // Clear form
        if (loginForm) loginForm.reset();
    }

    // Apply persona-specific UI customizations
    function applyPersonaCustomizations() {
        const body = document.body;
        
        // Remove existing persona classes
        body.classList.remove('persona-admin', 'persona-finance', 'persona-developer', 'persona-viewer');
        
        // Add current persona class
        body.classList.add(`persona-${currentUser.persona}`);
        
        // Show/hide features based on permissions
        const restrictedElements = document.querySelectorAll('[data-permission]');
        restrictedElements.forEach(element => {
            const requiredPermission = element.getAttribute('data-permission');
            if (currentUser.permissions.includes('all') || currentUser.permissions.includes(requiredPermission)) {
                element.style.display = '';
            } else {
                element.style.display = 'none';
            }
        });
    }

    // Sidebar toggle functionality
    function toggleSidebar() {
        sidebarCollapsed = !sidebarCollapsed;
        
        if (sidebarCollapsed) {
            if (sidebar) sidebar.classList.add('collapsed');
            if (mainContent) mainContent.classList.add('expanded');
        } else {
            if (sidebar) sidebar.classList.remove('collapsed');
            if (mainContent) mainContent.classList.remove('expanded');
        }
    }

    // Logout functionality
    function handleLogout() {
        currentUser = null;
        localStorage.removeItem('currentUser');
        showLogin();
    }

    // Update Efficiency Card from Projects Data
    function updateEfficiencyCardFromProjects() {
        const efficiencyItems = document.querySelectorAll('.efficiency-item');
        const efficiencyCard = document.getElementById('efficiencyCard');
        const efficiencyValue = document.getElementById('efficiencyValue');
        const efficiencyDetail = document.getElementById('efficiencyDetail');
        const efficiencyStatusFlag = document.getElementById('efficiencyStatusFlag');
        
        if (!efficiencyItems.length || !efficiencyCard) return;
        
        let onTrackCount = 0;
        let delayedCount = 0;
        let totalSavings = 0;
        let onTrackSavings = 0;
        
        efficiencyItems.forEach(item => {
            const statusEl = item.querySelector('.efficiency-status');
            const savingsEl = item.querySelector('.efficiency-item-savings');
            
            // Parse savings value
            let savings = 0;
            if (savingsEl) {
                const savingsText = savingsEl.textContent.replace('$', '').replace('M', '');
                savings = parseFloat(savingsText) || 0;
            }
            totalSavings += savings;
            
            if (statusEl) {
                if (statusEl.classList.contains('on-track')) {
                    onTrackCount++;
                    onTrackSavings += savings;
                } else if (statusEl.classList.contains('delayed')) {
                    delayedCount++;
                }
            }
        });
        
        const totalProjects = onTrackCount + delayedCount;
        const efficiencyPercent = totalProjects > 0 ? Math.round((onTrackCount / totalProjects) * 100) : 0;
        
        // Update card elements
        if (efficiencyValue) {
            efficiencyValue.textContent = efficiencyPercent + '%';
        }
        
        if (efficiencyDetail) {
            efficiencyDetail.textContent = `${onTrackCount} of ${totalProjects} projects on track ($${onTrackSavings.toFixed(1)}M)`;
        }
        
        // Update status flag and card styling based on score
        if (efficiencyStatusFlag && efficiencyCard) {
            efficiencyCard.classList.remove('critical', 'warning', 'good');
            efficiencyStatusFlag.classList.remove('critical-flag', 'warning-flag', 'good-flag');
            
            if (efficiencyPercent >= 80) {
                efficiencyCard.classList.add('good');
                efficiencyStatusFlag.classList.add('good-flag');
                efficiencyStatusFlag.textContent = 'Good';
            } else if (efficiencyPercent >= 50) {
                efficiencyCard.classList.add('warning');
                efficiencyStatusFlag.classList.add('warning-flag');
                efficiencyStatusFlag.textContent = 'Warning';
            } else {
                efficiencyCard.classList.add('critical');
                efficiencyStatusFlag.classList.add('critical-flag');
                efficiencyStatusFlag.textContent = 'Critical';
            }
        }
    }

    // Chart initialization and data
    function initializeCharts() {
        // Update Efficiency Card from Projects Data
        updateEfficiencyCardFromProjects();
        
        // Initialize Budget Chart for Landing Page
        initializeBudgetChartLanding();
        
        // Initialize Cost Overview Chart for Landing Page
        initializeCostOverviewChart();
        
        // Check if charts exist before initializing
        const totalCostCanvas = document.getElementById('totalCostChart');
        const costBreakdownCanvas = document.getElementById('costBreakdownChart');
        const storageCostCanvas = document.getElementById('storageCostChart');
        const azureCostCanvas = document.getElementById('azureCostChart');

        // Total Cost Trend Chart
        if (totalCostCanvas) {
            const totalCostCtx = totalCostCanvas.getContext('2d');
            new Chart(totalCostCtx, {
                type: 'line',
                data: {
                    labels: ['Jan 1', 'Jan 8', 'Jan 15', 'Jan 22', 'Jan 29', 'Feb 5', 'Feb 12', 'Feb 19', 'Feb 26'],
                    datasets: [{
                        label: 'Substrate',
                        data: [45, 47, 44, 46, 48, 45, 43, 41, 40],
                        borderColor: '#0078d4',
                        backgroundColor: 'rgba(0, 120, 212, 0.1)',
                        tension: 0.4
                    }, {
                        label: 'Azure Costs',
                        data: [15, 16, 14, 15, 17, 16, 14, 13, 12],
                        borderColor: '#00bcf2',
                        backgroundColor: 'rgba(0, 188, 242, 0.1)',
                        tension: 0.4
                    }, {
                        label: 'COSMIC',
                        data: [8, 9, 7, 8, 9, 8, 7, 6, 5],
                        borderColor: '#40e0d0',
                        backgroundColor: 'rgba(64, 224, 208, 0.1)',
                        tension: 0.4
                    }, {
                        label: 'Telemetry',
                        data: [12, 13, 11, 12, 14, 13, 11, 10, 9],
                        borderColor: '#ff6b6b',
                        backgroundColor: 'rgba(255, 107, 107, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Cost (Millions)'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }

        // Cost Breakdown Pie Chart
        if (costBreakdownCanvas) {
            const costBreakdownCtx = costBreakdownCanvas.getContext('2d');
            new Chart(costBreakdownCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Public Compute', 'AzSC Compute', 'Network', 'Storage', 'Other'],
                    datasets: [{
                        data: [164.42, 13.69, 27.68, 32.61, 135.81],
                        backgroundColor: [
                            '#0078d4',
                            '#00bcf2',
                            '#40e0d0',
                            '#ff6b6b',
                            '#ffa500'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }

        // Storage Cost Chart
        if (storageCostCanvas) {
            const storageCostCtx = storageCostCanvas.getContext('2d');
            new Chart(storageCostCtx, {
                type: 'line',
                data: {
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                    datasets: [{
                        label: 'HDD Storage',
                        data: [21.4, 21.2, 21.6, 21.4],
                        borderColor: '#0078d4',
                        backgroundColor: 'rgba(0, 120, 212, 0.1)',
                        tension: 0.4
                    }, {
                        label: 'SSD Storage',
                        data: [11.21, 11.45, 11.12, 11.21],
                        borderColor: '#00bcf2',
                        backgroundColor: 'rgba(0, 188, 242, 0.1)',
                        tension: 0.4
                    }, {
                        label: 'Network Storage',
                        data: [5.5, 5.7, 5.3, 5.6],
                        borderColor: '#40e0d0',
                        backgroundColor: 'rgba(64, 224, 208, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Cost (Millions)'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }

        // Azure Cost Detail Chart
        if (azureCostCanvas) {
            const azureCostCtx = azureCostCanvas.getContext('2d');
            new Chart(azureCostCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Cosmos', 'Kusto', 'Geneva MDS', 'Geneva MDM', 'Blueshift', 'Aria', 'Passive Monitoring'],
                    datasets: [{
                        data: [20.75, 27.05, 7.92, 3.48, 3.82, 1.06, 5.98],
                        backgroundColor: [
                            '#0078d4',
                            '#00bcf2',
                            '#40e0d0',
                            '#ff6b6b',
                            '#ffa500',
                            '#9b59b6',
                            '#2ecc71'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
    }

    // Navigation item click handlers
    document.addEventListener('click', function(e) {
        // Handle non-collapsible nav-category clicks (like COSMIC)
        if (e.target.closest('.nav-category:not(.collapsible)')) {
            e.preventDefault();
            e.stopPropagation();
            
            const category = e.target.closest('.nav-category');
            const navText = category.querySelector('.nav-text').textContent.trim();
            
            if (navText === 'COSMIC') {
                // Navigate to COSMIC page
                document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
                document.querySelectorAll('.nav-category').forEach(item => item.classList.remove('active'));
                category.classList.add('active');
                showCosmic();
                return;
            }
        }
        
        // Handle collapsible navigation sections
        if (e.target.closest('.nav-category.collapsible')) {
            e.preventDefault();
            e.stopPropagation();
            
            const category = e.target.closest('.nav-category.collapsible');
            const clickedElement = e.target;
            const navText = category.querySelector('.nav-text').textContent.trim();
            
            // Check if clicked on the expand icon (chevron)
            const clickedOnChevron = clickedElement.classList.contains('expand-icon') || 
                                     clickedElement.closest('.expand-icon');
            
            // If clicked on Substrate text or icon (but not chevron), navigate to page
            if (navText === 'Substrate' && !clickedOnChevron) {
                document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
                document.querySelectorAll('.nav-category').forEach(item => item.classList.remove('active'));
                category.classList.add('active');
                showSubstrate();
                return;
            }
            
            // If clicked on Azure Costs text or icon (but not chevron), navigate to page
            if (navText === 'Azure Costs' && !clickedOnChevron) {
                document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
                document.querySelectorAll('.nav-category').forEach(item => item.classList.remove('active'));
                category.classList.add('active');
                showAzure();
                return;
            }
            
            // If clicked on Telemetry text or icon (but not chevron), navigate to page
            if (navText === 'Telemetry' && !clickedOnChevron) {
                document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
                document.querySelectorAll('.nav-category').forEach(item => item.classList.remove('active'));
                category.classList.add('active');
                showTelemetry();
                return;
            }
            
            // Otherwise, handle expand/collapse
            const targetId = category.getAttribute('data-target');
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const isExpanded = category.classList.contains('expanded');
                
                if (isExpanded) {
                    // Collapse
                    category.classList.remove('expanded');
                    targetElement.classList.add('collapsed');
                } else {
                    // Expand
                    category.classList.add('expanded');
                    targetElement.classList.remove('collapsed');
                }
            }
            return;
        }
        
        // Handle subcategory clicks (including efficiency tracker subitems)
        if (e.target.closest('.nav-subcategory')) {
            e.preventDefault();
            e.stopPropagation();
            
            const subcategory = e.target.closest('.nav-subcategory');
            const pageType = subcategory.getAttribute('data-page');
            
            if (pageType === 'efficiency-virtualized') {
                showEfficiencyVirtualized();
                return;
            } else if (pageType === 'efficiency-baremetal') {
                showEfficiencyBaremetal();
                return;
            } else if (pageType === 'efficiency-bigbets') {
                showEfficiencyBigbets();
                return;
            }
        }
        
        if (e.target.closest('.nav-item')) {
            // Remove active class from all nav items
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to clicked item
            e.target.closest('.nav-item').classList.add('active');
            
            // Handle page switching
            const navItem = e.target.closest('.nav-item');
            const pageType = navItem.getAttribute('data-page');
            
            if (pageType === 'insights') {
                showInsightsPortal();
            } else if (pageType === 'dashboard') {
                showDashboard();
            } else if (pageType === 'finops') {
                showFinOps();
            }
            
            const navText = navItem.querySelector('.nav-text').textContent;
            console.log(`Navigating to: ${navText}`);
        }
    });

    // Mobile responsiveness
    function handleResize() {
        if (window.innerWidth <= 768) {
            sidebar.classList.add('mobile');
        } else {
            sidebar.classList.remove('mobile');
        }
    }

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call
    
    // Budget Chart functionality
    function generateBudgetChartData(fiscalYear, gems, categories) {
        // Ensure we have the data structure
        if (!finOpsData || !finOpsData[fiscalYear]) {
            console.error('FinOps data not found for:', fiscalYear);
            return null;
        }
        
        // Get base data - use 'all' if array contains 'all', otherwise aggregate
        let baseData;
        
        if (gems.includes('all') && categories.includes('all')) {
            baseData = finOpsData[fiscalYear]?.['all']?.['all'];
        } else if (gems.includes('all')) {
            baseData = finOpsData[fiscalYear]?.['all']?.[categories[0]] || finOpsData[fiscalYear]?.['all']?.['all'];
        } else if (categories.includes('all')) {
            baseData = finOpsData[fiscalYear]?.[gems[0]]?.['all'] || finOpsData[fiscalYear]?.['all']?.['all'];
        } else {
            baseData = finOpsData[fiscalYear]?.[gems[0]]?.[categories[0]] || finOpsData[fiscalYear]?.['all']?.['all'];
        }
        
        if (!baseData) {
            console.error('No base data found for selections:', fiscalYear, gems, categories);
            return null;
        }
        
        // Apply multiplier for multiple selections (simulating combined costs)
        let multiplier = 1;
        if (!gems.includes('all') && gems.length > 1) {
            multiplier *= gems.length * 0.8; // Slightly less than additive
        }
        if (!categories.includes('all') && categories.length > 1) {
            multiplier *= categories.length * 0.7; // Account for overlap
        }
        
        // Parse the budget and actual values
        const targetValue = parseFloat(baseData.currentYearTarget.replace(/[$M,]/g, '')) * multiplier;
        const actualValue = parseFloat(baseData.currentYearActual.replace(/[$M,]/g, '')) * multiplier;
        const forecastValue = parseFloat(baseData.forecastTotal.replace(/[$M,]/g, '')) * multiplier;
        
        // Generate monthly data points
        const months = ['06/01', '07/01', '08/01', '09/01', '10/01', '11/01', '12/01', '01/01', '02/01', '03/01', '04/01', '05/01'];
        const monthNames = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
        
        // Budget line (steady growth)
        const budgetData = months.map((_, index) => {
            return (targetValue / 12) * (index + 1);
        });
        
        // Actual line (current actual progress + forecast)
        const actualData = months.map((_, index) => {
            if (index < 5) { // First 5 months - actual data
                return (actualValue / 5) * (index + 1);
            } else { // Remaining months - forecasted
                const actualSoFar = actualValue;
                const remainingMonths = 12 - 5;
                const monthlyForecast = (forecastValue - actualSoFar) / remainingMonths;
                return actualSoFar + (monthlyForecast * (index - 4));
            }
        });
        
        return {
            labels: monthNames,
            budgetData,
            actualData,
            forecastStartIndex: 5
        };
    }

    function initializeBudgetChart() {
        console.log('Initializing budget chart...');
        const ctx = document.getElementById('budgetChart');
        if (!ctx) {
            console.error('Budget chart canvas not found');
            return;
        }
        console.log('Canvas found:', ctx);

        const chartData = generateBudgetChartData('FY26', ['all'], ['all']);
        if (!chartData) {
            console.error('Chart data generation failed');
            return;
        }
        console.log('Chart data generated:', chartData);
        
        if (budgetChart) {
            budgetChart.destroy();
        }
        
        budgetChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [
                {
                    label: 'Budget',
                    data: chartData.budgetData,
                    borderColor: '#0078d4',
                    backgroundColor: 'rgba(0, 120, 212, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.1
                }, 
                {
                    label: 'Actuals',
                    data: chartData.actualData.slice(0, chartData.forecastStartIndex + 1),
                    borderColor: '#d13212',
                    backgroundColor: 'rgba(209, 50, 18, 0.2)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.1
                }, 
                {
                    label: 'Forecast',
                    data: [...Array(chartData.forecastStartIndex).fill(null), ...chartData.actualData.slice(chartData.forecastStartIndex)],
                    borderColor: '#d13212',
                    backgroundColor: 'rgba(209, 50, 18, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 10
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#f0f0f0'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + (value).toFixed(0) + 'M';
                            },
                            font: {
                                size: 10
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'start',
                        labels: {
                            usePointStyle: true,
                            font: {
                                size: 11
                            },
                            padding: 15
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.98)',
                        titleColor: '#0078d4',
                        bodyColor: '#333',
                        borderColor: '#e1e1e1',
                        borderWidth: 1,
                        cornerRadius: 6,
                        displayColors: true,
                        padding: 12,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        titleFont: {
                            size: 13,
                            weight: '600'
                        },
                        bodyFont: {
                            size: 12
                        },
                        callbacks: {
                            title: function(context) {
                                const monthNames = ['June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May'];
                                return monthNames[context[0].dataIndex] + ' Budget Tracking';
                            },
                            label: function(context) {
                                const value = context.parsed.y;
                                const label = context.dataset.label;
                                let suffix = '';
                                
                                if (label === 'Forecast') {
                                    suffix = ' (Projected)';
                                } else if (label === 'Actuals') {
                                    suffix = ' (Current)';
                                } else if (label === 'Budget') {
                                    suffix = ' (Target)';
                                }
                                
                                return label + suffix + ': $' + value.toFixed(1) + 'M';
                            },
                            afterBody: function(context) {
                                if (context.length > 0) {
                                    const dataIndex = context[0].dataIndex;
                                    const budgetValue = context.find(c => c.dataset.label === 'Budget')?.parsed?.y || 0;
                                    const actualValue = context.find(c => c.dataset.label === 'Actuals')?.parsed?.y || 0;
                                    
                                    if (budgetValue && actualValue) {
                                        const variance = actualValue - budgetValue;
                                        const percentVariance = ((variance / budgetValue) * 100).toFixed(1);
                                        const status = variance >= 0 ? 'Over Budget' : 'Under Budget';
                                        
                                        return [
                                            '',
                                            `Variance: $${Math.abs(variance).toFixed(1)}M (${Math.abs(percentVariance)}%)`,
                                            `Status: ${status}`
                                        ];
                                    }
                                }
                                return [];
                            },
                            footer: function(context) {
                                if (context.length > 0) {
                                    const dataIndex = context[0].dataIndex;
                                    if (dataIndex >= 5) {
                                        return 'Note: Forecast data is projected based on current trends';
                                    } else {
                                        return 'Historical actual spending data';
                                    }
                                }
                                return '';
                            }
                        },
                        interaction: {
                            intersect: false,
                            mode: 'index'
                        }
                    }
                }
            }
        });
    }

    function initializeBudgetChartLanding() {
        const ctx = document.getElementById('budgetChartLanding');
        if (!ctx) {
            return;
        }

        const chartData = generateBudgetChartData('FY26', ['all'], ['all']);
        if (!chartData) {
            return;
        }
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [
                {
                    label: 'Budget',
                    data: chartData.budgetData,
                    borderColor: '#0078d4',
                    backgroundColor: 'rgba(0, 120, 212, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.1
                }, 
                {
                    label: 'Actuals',
                    data: chartData.actualData.slice(0, chartData.forecastStartIndex + 1),
                    borderColor: '#d13212',
                    backgroundColor: 'rgba(209, 50, 18, 0.2)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.1
                }, 
                {
                    label: 'Forecast',
                    data: [...Array(chartData.forecastStartIndex).fill(null), ...chartData.actualData.slice(chartData.forecastStartIndex)],
                    borderColor: '#d13212',
                    backgroundColor: 'rgba(209, 50, 18, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                hover: {
                    mode: 'index',
                    intersect: false
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 10
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#f0f0f0'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + (value).toFixed(0) + 'M';
                            },
                            font: {
                                size: 10
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'start',
                        labels: {
                            usePointStyle: true,
                            font: {
                                size: 11
                            },
                            padding: 15
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.98)',
                        titleColor: '#0078d4',
                        bodyColor: '#333',
                        borderColor: '#e1e1e1',
                        borderWidth: 1,
                        cornerRadius: 6,
                        displayColors: true,
                        padding: 12,
                        titleFont: {
                            size: 13,
                            weight: '600'
                        },
                        bodyFont: {
                            size: 12
                        },
                        callbacks: {
                            title: function(context) {
                                const monthNames = ['June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May'];
                                return monthNames[context[0].dataIndex] + ' Budget Overview';
                            },
                            label: function(context) {
                                const value = context.parsed.y;
                                const label = context.dataset.label;
                                let suffix = '';
                                
                                if (label === 'Forecast') {
                                    suffix = ' (Projected)';
                                } else if (label === 'Actuals') {
                                    suffix = ' (Current)';
                                } else if (label === 'Budget') {
                                    suffix = ' (Target)';
                                }
                                
                                return label + suffix + ': $' + value.toFixed(1) + 'M';
                            }
                        }
                    }
                }
            }
        });
    }

    // Global variable to store the cost overview chart
    let costOverviewChart = null;

    // Cost overview data for all views
    const costOverviewData = {
        overview: {
            title: 'Cost Overview',
            labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
            datasets: [
                { label: 'Azure', data: [42.5, 44.2, 43.8, 46.1, 47.3, 45.9, 48.2, 49.1, 51.3, 52.8, 54.2, 55.1], color: '#0078d4', legendClass: 'azure' },
                { label: 'Substrate', data: [213.7, 218.3, 216.2, 223.3, 227.1, 222.5, 230.3, 233.6, 239.1, 243.0, 247.3, 250.6], color: '#107c10', legendClass: 'substrate' },
                { label: 'Cosmic', data: [22.3, 23.1, 22.8, 24.2, 24.9, 24.1, 25.5, 26.2, 27.1, 27.8, 28.5, 29.1], color: '#8764b8', legendClass: 'cosmic' },
                { label: 'Telemetry', data: [15.8, 16.4, 16.1, 17.2, 17.8, 17.1, 18.3, 18.9, 19.6, 20.2, 20.9, 21.4], color: '#00b7c3', legendClass: 'telemetry' }
            ]
        },
        azure: {
            title: 'Azure Cost Breakdown',
            labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
            datasets: [
                { label: 'Compute', data: [18.2, 19.1, 18.8, 19.8, 20.3, 19.7, 20.8, 21.2, 22.1, 22.8, 23.4, 23.8], color: '#0078d4', legendClass: 'compute' },
                { label: 'Storage', data: [8.5, 8.8, 8.7, 9.2, 9.4, 9.1, 9.6, 9.8, 10.2, 10.5, 10.8, 11.0], color: '#107c10', legendClass: 'storage' },
                { label: 'Network', data: [6.3, 6.5, 6.4, 6.8, 7.0, 6.8, 7.1, 7.3, 7.6, 7.8, 8.0, 8.2], color: '#ff8c00', legendClass: 'network' },
                { label: 'Database', data: [5.8, 6.0, 5.9, 6.2, 6.4, 6.2, 6.5, 6.7, 6.9, 7.1, 7.3, 7.5], color: '#8764b8', legendClass: 'database' },
                { label: 'Other', data: [3.7, 3.8, 4.0, 4.1, 4.2, 4.1, 4.2, 4.1, 4.5, 4.6, 4.7, 4.6], color: '#00b7c3', legendClass: 'other' }
            ]
        },
        substrate: {
            title: 'Substrate Cost Breakdown',
            labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
            datasets: [
                { label: 'Transaction', data: [42.1, 43.0, 42.6, 44.0, 44.8, 43.7, 45.4, 46.1, 47.2, 47.9, 48.8, 49.5], color: '#0078d4', legendClass: 'compute' },
                { label: 'Process Hosting', data: [18.5, 18.9, 18.7, 19.4, 19.7, 19.2, 20.0, 20.3, 20.8, 21.1, 21.5, 21.8], color: '#107c10', legendClass: 'storage' },
                { label: 'Network', data: [12.3, 12.6, 12.5, 12.9, 13.1, 12.8, 13.3, 13.5, 13.9, 14.1, 14.4, 14.6], color: '#ff8c00', legendClass: 'network' },
                { label: 'HDD Storage', data: [7.8, 8.0, 7.9, 8.2, 8.4, 8.2, 8.5, 8.6, 8.9, 9.0, 9.2, 9.3], color: '#8764b8', legendClass: 'database' },
                { label: 'SSD Storage', data: [4.5, 4.6, 4.7, 4.7, 4.8, 4.7, 4.9, 5.0, 5.0, 5.1, 5.2, 5.3], color: '#00b7c3', legendClass: 'other' }
            ]
        },
        cosmic: {
            title: 'Cosmic Cost Breakdown',
            labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
            datasets: [
                { label: 'Search Index', data: [8.9, 9.2, 9.1, 9.7, 10.0, 9.6, 10.2, 10.5, 10.8, 11.1, 11.4, 11.6], color: '#0078d4', legendClass: 'compute' },
                { label: 'Query Processing', data: [6.7, 6.9, 6.8, 7.2, 7.4, 7.2, 7.6, 7.8, 8.1, 8.3, 8.5, 8.7], color: '#107c10', legendClass: 'storage' },
                { label: 'Data Ingestion', data: [4.5, 4.7, 4.6, 4.9, 5.0, 4.9, 5.2, 5.3, 5.5, 5.6, 5.8, 5.9], color: '#ff8c00', legendClass: 'network' },
                { label: 'Storage', data: [2.2, 2.3, 2.3, 2.4, 2.5, 2.4, 2.5, 2.6, 2.7, 2.8, 2.8, 2.9], color: '#8764b8', legendClass: 'database' }
            ]
        },
        telemetry: {
            title: 'Telemetry Cost Breakdown',
            labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
            datasets: [
                { label: 'Data Collection', data: [6.3, 6.5, 6.4, 6.9, 7.1, 6.8, 7.3, 7.5, 7.8, 8.0, 8.3, 8.5], color: '#0078d4', legendClass: 'compute' },
                { label: 'Processing', data: [4.2, 4.4, 4.3, 4.6, 4.7, 4.5, 4.9, 5.0, 5.2, 5.4, 5.5, 5.7], color: '#107c10', legendClass: 'storage' },
                { label: 'Storage', data: [3.1, 3.2, 3.2, 3.4, 3.5, 3.4, 3.6, 3.7, 3.8, 4.0, 4.1, 4.2], color: '#ff8c00', legendClass: 'network' },
                { label: 'Analytics', data: [2.2, 2.3, 2.2, 2.3, 2.5, 2.4, 2.5, 2.7, 2.8, 2.8, 3.0, 3.0], color: '#8764b8', legendClass: 'database' }
            ]
        }
    };

    function initializeCostOverviewChart() {
        const ctx = document.getElementById('costOverviewChart');
        if (!ctx) {
            return;
        }

        // Set up dropdown event listener
        const dropdown = document.getElementById('costOverviewDropdown');
        if (dropdown) {
            dropdown.addEventListener('change', function() {
                updateCostOverviewChart(this.value);
            });
        }

        // Set up "Show Details" button event listener
        const detailsBtn = document.getElementById('costOverviewDetailsBtn');
        if (detailsBtn) {
            detailsBtn.addEventListener('click', function() {
                const viewKey = this.getAttribute('data-view');
                if (viewKey) {
                    navigateToCostOverviewDetail(viewKey);
                }
            });
        }

        // Initialize with overview data
        const viewData = costOverviewData.overview;
        
        costOverviewChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: viewData.labels,
                datasets: viewData.datasets.map(ds => ({
                    label: ds.label,
                    data: ds.data,
                    borderColor: ds.color,
                    backgroundColor: ds.color.replace(')', ', 0.1)').replace('rgb', 'rgba'),
                    borderWidth: 2,
                    fill: false,
                    tension: 0.3,
                    pointRadius: 3,
                    pointHoverRadius: 5
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 11
                            }
                        }
                    },
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: '#f0f0f0'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(0) + 'M';
                            },
                            font: {
                                size: 11
                            }
                        },
                        title: {
                            display: true,
                            text: 'Monthly Cost (Millions)',
                            font: {
                                size: 12
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false // Using custom legend in HTML
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.98)',
                        titleColor: '#333',
                        bodyColor: '#333',
                        borderColor: '#e1e1e1',
                        borderWidth: 1,
                        cornerRadius: 6,
                        displayColors: true,
                        padding: 12,
                        titleFont: {
                            size: 13,
                            weight: '600'
                        },
                        bodyFont: {
                            size: 12
                        },
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': $' + context.parsed.y.toFixed(1) + 'M';
                            }
                        }
                    }
                }
            }
        });
    }

    function updateCostOverviewChart(viewKey) {
        if (!costOverviewChart) return;
        
        const viewData = costOverviewData[viewKey];
        if (!viewData) return;
        
        // Update title
        const titleElement = document.getElementById('costOverviewTitle');
        if (titleElement) {
            titleElement.textContent = viewData.title;
        }
        
        // Update legend
        const legendElement = document.getElementById('costOverviewLegend');
        if (legendElement) {
            legendElement.innerHTML = viewData.datasets.map(ds => 
                `<div class="legend-item"><span class="legend-dot ${ds.legendClass}"></span> ${ds.label}</div>`
            ).join('');
        }
        
        // Show/hide "Show Details" button based on selection
        const detailsBtn = document.getElementById('costOverviewDetailsBtn');
        if (detailsBtn) {
            if (viewKey === 'overview') {
                detailsBtn.classList.add('hidden');
            } else {
                detailsBtn.classList.remove('hidden');
                detailsBtn.setAttribute('data-view', viewKey);
            }
        }
        
        // Update chart data
        costOverviewChart.data.labels = viewData.labels;
        costOverviewChart.data.datasets = viewData.datasets.map(ds => ({
            label: ds.label,
            data: ds.data,
            borderColor: ds.color,
            backgroundColor: ds.color.replace(')', ', 0.1)').replace('rgb', 'rgba'),
            borderWidth: 2,
            fill: false,
            tension: 0.3,
            pointRadius: 3,
            pointHoverRadius: 5
        }));
        
        costOverviewChart.update();
    }

    // Handle Cost Overview "Show Details" button navigation
    function navigateToCostOverviewDetail(viewKey) {
        // Map dropdown values to navigation targets
        const navigationMap = {
            'azure': { type: 'page', action: showAzure, navTarget: 'azure-items', navText: 'Azure Costs' },
            'substrate': { type: 'page', action: showSubstrate, navTarget: 'substrate-items', navText: 'Substrate' },
            'cosmic': { type: 'page', action: showCosmic, navTarget: null, navText: 'COSMIC' },
            'telemetry': { type: 'page', action: showTelemetry, navTarget: 'telemetry-items', navText: 'Telemetry' }
        };
        
        const nav = navigationMap[viewKey];
        if (!nav) return;
        
        // Update sidebar active state
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        document.querySelectorAll('.nav-category').forEach(item => item.classList.remove('active'));
        
        // Expand the related sidebar section and mark as active
        if (nav.navTarget) {
            const subcategories = document.getElementById(nav.navTarget);
            if (subcategories) {
                subcategories.classList.remove('collapsed');
                const parentCategory = document.querySelector(`[data-target="${nav.navTarget}"]`);
                if (parentCategory) {
                    parentCategory.classList.add('active');
                    const icon = parentCategory.querySelector('.expand-icon');
                    if (icon) {
                        icon.classList.remove('fa-chevron-right');
                        icon.classList.add('fa-chevron-down');
                    }
                }
            }
        } else if (nav.navText) {
            // For items without collapsible sections (like COSMIC)
            const navCategories = document.querySelectorAll('.nav-category');
            navCategories.forEach(cat => {
                const textSpan = cat.querySelector('.nav-text');
                if (textSpan && textSpan.textContent === nav.navText) {
                    cat.classList.add('active');
                }
            });
        }
        
        // Navigate to the page
        if (nav.action) {
            nav.action();
        }
    }

    function updateBudgetChart() {
        if (!budgetChart) {
            console.error('Budget chart not initialized');
            return;
        }

        const fiscalYear = document.getElementById('fiscalYearFilter')?.value || 'FY26';
        const gems = getSelectedValues('gemsFilterContainer');
        const categories = getSelectedValues('categoriesFilterContainer');

        console.log('Updating chart with:', fiscalYear, gems, categories);
        const chartData = generateBudgetChartData(fiscalYear, gems, categories);
        
        if (!chartData) {
            console.error('Failed to generate chart data for update');
            return;
        }
        
        console.log('Updating chart with data:', chartData);
        
        // Update budget line
        budgetChart.data.datasets[0].data = chartData.budgetData;
        
        // Update actuals line (solid part)
        budgetChart.data.datasets[1].data = chartData.actualData.slice(0, chartData.forecastStartIndex + 1);
        
        // Update forecast line (dashed part) 
        budgetChart.data.datasets[2].data = [...Array(chartData.forecastStartIndex).fill(null), ...chartData.actualData.slice(chartData.forecastStartIndex)];
        
        budgetChart.update('none');
    }

    function generateYoYTableData(gems, categories) {
        // Get base data
        let fy25Data, fy26Data;
        
        if (gems.includes('all') && categories.includes('all')) {
            fy25Data = finOpsData['FY25']?.['all']?.['all'];
            fy26Data = finOpsData['FY26']?.['all']?.['all'];
        } else if (gems.includes('all')) {
            fy25Data = finOpsData['FY25']?.['all']?.[categories[0]] || finOpsData['FY25']?.['all']?.['all'];
            fy26Data = finOpsData['FY26']?.['all']?.[categories[0]] || finOpsData['FY26']?.['all']?.['all'];
        } else if (categories.includes('all')) {
            fy25Data = finOpsData['FY25']?.[gems[0]]?.['all'] || finOpsData['FY25']?.['all']?.['all'];
            fy26Data = finOpsData['FY26']?.[gems[0]]?.['all'] || finOpsData['FY26']?.['all']?.['all'];
        } else {
            fy25Data = finOpsData['FY25']?.[gems[0]]?.[categories[0]] || finOpsData['FY25']?.['all']?.['all'];
            fy26Data = finOpsData['FY26']?.[gems[0]]?.[categories[0]] || finOpsData['FY26']?.['all']?.['all'];
        }
        
        if (!fy25Data || !fy26Data) return null;
        
        // Apply multiplier for multiple selections
        let multiplier = 1;
        if (!gems.includes('all') && gems.length > 1) {
            multiplier *= gems.length * 0.8;
        }
        if (!categories.includes('all') && categories.length > 1) {
            multiplier *= categories.length * 0.7;
        }
        
        if (!fy25Data || !fy26Data) return null;
        
        // Generate monthly data for both years
        const months = 12;
        const fy25Monthly = [];
        const fy26Monthly = [];
        
        // Parse annual values
        const fy25Annual = parseFloat(fy25Data.currentYearTarget.replace(/[$M,]/g, '')) * multiplier;
        const fy26Annual = parseFloat(fy26Data.currentYearTarget.replace(/[$M,]/g, '')) * multiplier;
        
        // Generate monthly progression with some variance
        for (let i = 0; i < months; i++) {
            const baseProgress = (i + 1) / months;
            const variance = (Math.sin(i * 0.5) * 0.1 + 1); // Add seasonal variance
            
            fy25Monthly.push((fy25Annual * baseProgress * variance) / (i + 1));
            fy26Monthly.push((fy26Annual * baseProgress * variance) / (i + 1));
        }
        
        // Calculate deltas and percentages
        const deltas = fy26Monthly.map((fy26, i) => fy26 - fy25Monthly[i]);
        const percentages = fy25Monthly.map((fy25, i) => fy25 > 0 ? ((fy26Monthly[i] - fy25) / fy25) * 100 : 0);
        
        return {
            fy25: fy25Monthly,
            fy26: fy26Monthly,
            deltas: deltas,
            percentages: percentages,
            fy25Total: fy25Annual,
            fy26Total: fy26Annual,
            totalDelta: fy26Annual - fy25Annual,
            totalPercentage: fy25Annual > 0 ? ((fy26Annual - fy25Annual) / fy25Annual) * 100 : 0
        };
    }

    function updateYoYTable() {
        const gems = getSelectedValues('gemsFilterContainer');
        const categories = getSelectedValues('categoriesFilterContainer');
        const tableBody = document.getElementById('yoyTableBody');
        
        if (!tableBody) return;
        
        const data = generateYoYTableData(gems, categories);
        if (!data) return;
        
        const formatCurrency = (value) => '$' + (value * 1000000).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0});
        const formatPercentage = (value) => (value >= 0 ? '+' : '') + value.toFixed(1) + '%';
        
        tableBody.innerHTML = `
            <tr class="fy25-row">
                <td>Cost FY25</td>
                ${data.fy25.map(val => `<td>${formatCurrency(val)}</td>`).join('')}
                <td>${formatCurrency(data.fy25Total)}</td>
            </tr>
            <tr class="fy26-row">
                <td>Cost FY26</td>
                ${data.fy26.map(val => `<td>${formatCurrency(val)}</td>`).join('')}
                <td>${formatCurrency(data.fy26Total)}</td>
            </tr>
            <tr class="delta-row">
                <td>YoY Δ</td>
                ${data.deltas.map(val => `<td class="${val >= 0 ? 'positive' : 'negative'}">${val >= 0 ? '+' : ''}${formatCurrency(Math.abs(val))}</td>`).join('')}
                <td class="${data.totalDelta >= 0 ? 'positive' : 'negative'}">${data.totalDelta >= 0 ? '+' : ''}${formatCurrency(Math.abs(data.totalDelta))}</td>
            </tr>
            <tr class="percentage-row">
                <td>YoY %</td>
                ${data.percentages.map(val => `<td class="${val >= 0 ? 'positive' : 'negative'}">${formatPercentage(val)}</td>`).join('')}
                <td class="${data.totalPercentage >= 0 ? 'positive' : 'negative'}">${formatPercentage(data.totalPercentage)}</td>
            </tr>
        `;
    }

    function generateOverviewData(gems, categories) {
        // Get base data
        let fy25Data, fy26Data;
        
        if (gems.includes('all') && categories.includes('all')) {
            fy25Data = finOpsData['FY25']?.['all']?.['all'];
            fy26Data = finOpsData['FY26']?.['all']?.['all'];
        } else if (gems.includes('all')) {
            fy25Data = finOpsData['FY25']?.['all']?.[categories[0]] || finOpsData['FY25']?.['all']?.['all'];
            fy26Data = finOpsData['FY26']?.['all']?.[categories[0]] || finOpsData['FY26']?.['all']?.['all'];
        } else if (categories.includes('all')) {
            fy25Data = finOpsData['FY25']?.[gems[0]]?.['all'] || finOpsData['FY25']?.['all']?.['all'];
            fy26Data = finOpsData['FY26']?.[gems[0]]?.['all'] || finOpsData['FY26']?.['all']?.['all'];
        } else {
            fy25Data = finOpsData['FY25']?.[gems[0]]?.[categories[0]] || finOpsData['FY25']?.['all']?.['all'];
            fy26Data = finOpsData['FY26']?.[gems[0]]?.[categories[0]] || finOpsData['FY26']?.['all']?.['all'];
        }
        
        if (!fy25Data || !fy26Data) return null;
        
        // Apply multiplier for multiple selections
        let multiplier = 1;
        if (!gems.includes('all') && gems.length > 1) {
            multiplier *= gems.length * 0.8;
        }
        if (!categories.includes('all') && categories.length > 1) {
            multiplier *= categories.length * 0.7;
        }
        
        const fy25Target = parseFloat(fy25Data.currentYearTarget.replace(/[$M,]/g, '')) * multiplier;
        const fy25Actual = fy25Target * 0.98; // Simulate actual
        const fy26Target = parseFloat(fy26Data.currentYearTarget.replace(/[$M,]/g, '')) * multiplier;
        const fy26Current = parseFloat(fy26Data.currentYearActual.replace(/[$M,]/g, '')) * multiplier;
        const fy26Remaining = parseFloat(fy26Data.forecastRemaining.replace(/[$M,]/g, '')) * multiplier;
        const fy26Total = parseFloat(fy26Data.forecastTotal.replace(/[$M,]/g, '')) * multiplier;
        
        return {
            fy25Target,
            fy25Actual,
            fy25Delta: fy25Actual - fy25Target,
            fy26Target,
            fy26Current,
            fy26Remaining,
            fy26Total,
            fy26Delta: fy26Total - fy26Target
        };
    }

    function updateAIOverviewTable() {
        const gems = getSelectedValues('gemsFilterContainer');
        const categories = getSelectedValues('categoriesFilterContainer');
        const tableBody = document.getElementById('aiOverviewBody');
        
        if (!tableBody) return;
        
        const baseData = generateOverviewData(gems, categories);
        if (!baseData) return;
        
        // Calculate AI vs Non-AI distribution (AI typically 23-27% of total spend)
        const aiPercentage = 0.25;
        const nonAiPercentage = 0.75;
        
        const aiData = {
            fy25Target: baseData.fy25Target * aiPercentage,
            fy25Actual: baseData.fy25Actual * aiPercentage,
            fy25Delta: 0,
            fy26Target: baseData.fy26Target * aiPercentage,
            fy26Current: baseData.fy26Current * aiPercentage,
            fy26Remaining: baseData.fy26Remaining * aiPercentage,
            fy26Total: baseData.fy26Total * aiPercentage,
            fy26Delta: (baseData.fy26Total * aiPercentage) - (baseData.fy26Target * aiPercentage)
        };
        
        const nonAiData = {
            fy25Target: baseData.fy25Target * nonAiPercentage,
            fy25Actual: baseData.fy25Actual * nonAiPercentage,
            fy25Delta: 0,
            fy26Target: baseData.fy26Target * nonAiPercentage,
            fy26Current: baseData.fy26Current * nonAiPercentage,
            fy26Remaining: baseData.fy26Remaining * nonAiPercentage,
            fy26Total: baseData.fy26Total * nonAiPercentage,
            fy26Delta: (baseData.fy26Total * nonAiPercentage) - (baseData.fy26Target * nonAiPercentage)
        };
        
        const formatCurrency = (value) => '$' + value.toFixed(2) + 'M';
        const formatDelta = (value) => {
            if (Math.abs(value) < 0.01) return '$0';
            const formatted = (value >= 0 ? '+' : '') + '$' + Math.abs(value).toFixed(2) + 'M';
            const cssClass = value > 0 ? 'delta-positive' : value < 0 ? 'delta-negative' : 'delta-zero';
            return `<span class="${cssClass}">${formatted}</span>`;
        };
        
        tableBody.innerHTML = `
            <tr class="ai-row">
                <td>AI</td>
                <td>${formatCurrency(aiData.fy25Target)}</td>
                <td>${formatCurrency(aiData.fy25Actual)}</td>
                <td>${formatDelta(aiData.fy25Delta)}</td>
                <td>${formatCurrency(aiData.fy26Target)}</td>
                <td>${formatCurrency(aiData.fy26Current)}</td>
                <td>${formatCurrency(aiData.fy26Remaining)}</td>
                <td>${formatCurrency(aiData.fy26Total)}</td>
                <td>${formatDelta(aiData.fy26Delta)}</td>
            </tr>
            <tr class="non-ai-row">
                <td>Non-AI</td>
                <td>${formatCurrency(nonAiData.fy25Target)}</td>
                <td>${formatCurrency(nonAiData.fy25Actual)}</td>
                <td>${formatDelta(nonAiData.fy25Delta)}</td>
                <td>${formatCurrency(nonAiData.fy26Target)}</td>
                <td>${formatCurrency(nonAiData.fy26Current)}</td>
                <td>${formatCurrency(nonAiData.fy26Remaining)}</td>
                <td>${formatCurrency(nonAiData.fy26Total)}</td>
                <td>${formatDelta(nonAiData.fy26Delta)}</td>
            </tr>
            <tr class="total-row">
                <td>Total</td>
                <td>${formatCurrency(baseData.fy25Target)}</td>
                <td>${formatCurrency(baseData.fy25Actual)}</td>
                <td>${formatDelta(baseData.fy25Delta)}</td>
                <td>${formatCurrency(baseData.fy26Target)}</td>
                <td>${formatCurrency(baseData.fy26Current)}</td>
                <td>${formatCurrency(baseData.fy26Remaining)}</td>
                <td>${formatCurrency(baseData.fy26Total)}</td>
                <td>${formatDelta(baseData.fy26Delta)}</td>
            </tr>
        `;
    }

    function updateCategoryOverviewTable() {
        const gems = getSelectedValues('gemsFilterContainer');
        const tableBody = document.getElementById('categoryOverviewBody');
        
        if (!tableBody) return;
        
        const baseData = generateOverviewData(gems, ['all']);
        if (!baseData) return;
        
        // Category distribution percentages
        const categories = {
            'Azure': 0.45,
            'Compute': 0.22,
            'M365 Network': 0.18,
            'Passive Monitoring': 0.15
        };
        
        const formatCurrency = (value) => '$' + value.toFixed(2) + 'M';
        const formatDelta = (value) => {
            if (Math.abs(value) < 0.01) return '$0';
            const formatted = (value >= 0 ? '+' : '') + '$' + Math.abs(value).toFixed(2) + 'M';
            const cssClass = value > 0 ? 'delta-positive' : value < 0 ? 'delta-negative' : 'delta-zero';
            return `<span class="${cssClass}">${formatted}</span>`;
        };
        
        let categoryRows = '';
        Object.entries(categories).forEach(([name, percentage], index) => {
            const categoryData = {
                fy25Target: baseData.fy25Target * percentage,
                fy25Actual: baseData.fy25Actual * percentage,
                fy25Delta: 0,
                fy26Target: baseData.fy26Target * percentage,
                fy26Current: baseData.fy26Current * percentage,
                fy26Remaining: baseData.fy26Remaining * percentage,
                fy26Total: baseData.fy26Total * percentage,
                fy26Delta: (baseData.fy26Total * percentage) - (baseData.fy26Target * percentage)
            };
            
            const rowClass = name.toLowerCase().replace(/\s+/g, '-') + '-row';
            categoryRows += `
                <tr class="${rowClass}">
                    <td>${name}</td>
                    <td>${formatCurrency(categoryData.fy25Target)}</td>
                    <td>${formatCurrency(categoryData.fy25Actual)}</td>
                    <td>${formatDelta(categoryData.fy25Delta)}</td>
                    <td>${formatCurrency(categoryData.fy26Target)}</td>
                    <td>${formatCurrency(categoryData.fy26Current)}</td>
                    <td>${formatCurrency(categoryData.fy26Remaining)}</td>
                    <td>${formatCurrency(categoryData.fy26Total)}</td>
                    <td>${formatDelta(categoryData.fy26Delta)}</td>
                </tr>
            `;
        });
        
        tableBody.innerHTML = categoryRows + `
            <tr class="total-row">
                <td>Total</td>
                <td>${formatCurrency(baseData.fy25Target)}</td>
                <td>${formatCurrency(baseData.fy25Actual)}</td>
                <td>${formatDelta(baseData.fy25Delta)}</td>
                <td>${formatCurrency(baseData.fy26Target)}</td>
                <td>${formatCurrency(baseData.fy26Current)}</td>
                <td>${formatCurrency(baseData.fy26Remaining)}</td>
                <td>${formatCurrency(baseData.fy26Total)}</td>
                <td>${formatDelta(baseData.fy26Delta)}</td>
            </tr>
        `;
    }

    function updateGEMSummaryTable() {
        const gemsFilterContainer = document.getElementById('gemsFilterContainer');
        const gemSummarySection = document.getElementById('gemSummaryContainer');
        const gemSummaryBody = document.getElementById('gemSummaryBody');
        
        if (!gemsFilterContainer || !gemSummarySection || !gemSummaryBody) {
            console.log('GEM Summary elements not found');
            return;
        }
        
        const selectedGems = getSelectedValues('gemsFilterContainer');
        console.log('Selected GEMs for summary:', selectedGems);
        
        // Show GEM summary table only if specific GEMs are selected (not 'all')
        if (selectedGems.includes('all') || selectedGems.length === 0) {
            gemSummarySection.style.display = 'none';
            console.log('Hiding GEM summary - All GEMs selected');
            return;
        }
        
        // Show and populate GEM summary table
        gemSummarySection.style.display = 'block';
        console.log('Showing GEM summary for:', selectedGems);
        
        const selectedCategories = getSelectedValues('categoriesFilterContainer');
        const formatCurrency = (value) => '$' + value.toFixed(2) + 'M';
        const formatDelta = (value) => {
            if (Math.abs(value) < 0.01) return '$0';
            const formatted = (value >= 0 ? '+' : '') + '$' + Math.abs(value).toFixed(2) + 'M';
            const cssClass = value > 0 ? 'delta-positive' : value < 0 ? 'delta-negative' : 'delta-zero';
            return `<span class="${cssClass}">${formatted}</span>`;
        };
        const formatPercentage = (value) => {
            const formatted = (value >= 0 ? '+' : '') + value.toFixed(1) + '%';
            const cssClass = value > 0 ? 'delta-positive' : value < 0 ? 'delta-negative' : 'delta-zero';
            return `<span class="${cssClass}">${formatted}</span>`;
        };
        
        // Generate GEM-specific data
        let summaryRows = '';
        let totalData = {
            fy25Target: 0, fy25Actual: 0, fy25Delta: 0,
            fy26Target: 0, fy26Current: 0, fy26Remaining: 0, fy26Total: 0, fy26Delta: 0,
            septemberSpend: 0, yoyValues: [], septemberYoY: [], septemberMoM: []
        };
        
        selectedGems.forEach(gem => {
            const gemData = generateOverviewData([gem], selectedCategories);
            if (gemData) {
                const gemName = gem === 'azure' ? 'Azure Services' :
                              gem === 'office365' ? 'Office 365' :
                              gem === 'dynamics' ? 'Dynamics 365' :
                              gem === 'powerplatform' ? 'Power Platform' :
                              gem === 'security' ? 'Security & Compliance' :
                              gem === 'teams' ? 'Teams & Communication' : gem;
                
                // Calculate additional metrics
                const yoyPercentage = gemData.fy25Actual > 0 ? ((gemData.fy26Total - gemData.fy25Actual) / gemData.fy25Actual) * 100 : 0;
                const septemberSpend = gemData.fy26Current * 0.12; // Simulate ~12% of current year spend in September
                const septemberYoY = (Math.random() - 0.5) * 30; // Random YoY between -15% and +15%
                const septemberMoM = (Math.random() - 0.5) * 20; // Random MoM between -10% and +10%
                
                const rowClass = gem.toLowerCase().replace(/\s+/g, '-') + '-gem-row';
                summaryRows += `
                    <tr class="${rowClass}">
                        <td>${gemName}</td>
                        <td>${formatCurrency(gemData.fy25Target)}</td>
                        <td>${formatCurrency(gemData.fy25Actual)}</td>
                        <td>${formatDelta(gemData.fy25Delta)}</td>
                        <td>${formatCurrency(gemData.fy26Target)}</td>
                        <td>${formatCurrency(gemData.fy26Current)}</td>
                        <td>${formatCurrency(gemData.fy26Remaining)}</td>
                        <td>${formatCurrency(gemData.fy26Total)}</td>
                        <td>${formatDelta(gemData.fy26Delta)}</td>
                        <td>${formatPercentage(yoyPercentage)}</td>
                        <td>${formatCurrency(septemberSpend)}</td>
                        <td>${formatPercentage(septemberYoY)}</td>
                        <td>${formatPercentage(septemberMoM)}</td>
                    </tr>
                `;
                
                // Add to totals
                totalData.fy25Target += gemData.fy25Target;
                totalData.fy25Actual += gemData.fy25Actual;
                totalData.fy25Delta += gemData.fy25Delta;
                totalData.fy26Target += gemData.fy26Target;
                totalData.fy26Current += gemData.fy26Current;
                totalData.fy26Remaining += gemData.fy26Remaining;
                totalData.fy26Total += gemData.fy26Total;
                totalData.fy26Delta += gemData.fy26Delta;
                totalData.septemberSpend += septemberSpend;
                totalData.yoyValues.push(yoyPercentage);
                totalData.septemberYoY.push(septemberYoY);
                totalData.septemberMoM.push(septemberMoM);
            }
        });
        
        // Calculate totals for percentage columns
        const totalYoYPercentage = totalData.fy25Actual > 0 ? ((totalData.fy26Total - totalData.fy25Actual) / totalData.fy25Actual) * 100 : 0;
        const avgSeptemberYoY = totalData.septemberYoY.length > 0 ? totalData.septemberYoY.reduce((a, b) => a + b, 0) / totalData.septemberYoY.length : 0;
        const avgSeptemberMoM = totalData.septemberMoM.length > 0 ? totalData.septemberMoM.reduce((a, b) => a + b, 0) / totalData.septemberMoM.length : 0;
        
        gemSummaryBody.innerHTML = summaryRows + `
            <tr class="total-row">
                <td><strong>Total</strong></td>
                <td>${formatCurrency(totalData.fy25Target)}</td>
                <td>${formatCurrency(totalData.fy25Actual)}</td>
                <td>${formatDelta(totalData.fy25Delta)}</td>
                <td>${formatCurrency(totalData.fy26Target)}</td>
                <td>${formatCurrency(totalData.fy26Current)}</td>
                <td>${formatCurrency(totalData.fy26Remaining)}</td>
                <td>${formatCurrency(totalData.fy26Total)}</td>
                <td>${formatDelta(totalData.fy26Delta)}</td>
                <td>${formatPercentage(totalYoYPercentage)}</td>
                <td>${formatCurrency(totalData.septemberSpend)}</td>
                <td>${formatPercentage(avgSeptemberYoY)}</td>
                <td>${formatPercentage(avgSeptemberMoM)}</td>
            </tr>
        `;
    }

    // FinOps filtering functionality
    function getSelectedValues(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return ['all'];
        
        const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
        const selected = Array.from(checkboxes).map(cb => cb.value);
        
        // If 'all' is selected or nothing is selected, return ['all']
        if (selected.includes('all') || selected.length === 0) {
            return ['all'];
        }
        return selected;
    }

    function handleCheckboxChange(containerId, checkbox) {
        const container = document.getElementById(containerId);
        const allCheckbox = container.querySelector('input[value="all"]');
        const otherCheckboxes = Array.from(container.querySelectorAll('input[type="checkbox"]')).filter(cb => cb.value !== 'all');
        
        if (checkbox.value === 'all') {
            // If 'All' was checked, uncheck all others
            if (checkbox.checked) {
                otherCheckboxes.forEach(cb => cb.checked = false);
            }
        } else {
            // If any specific item was checked, uncheck 'All'
            if (checkbox.checked) {
                allCheckbox.checked = false;
            }
            // If no specific items are checked, check 'All'
            const anyChecked = otherCheckboxes.some(cb => cb.checked);
            if (!anyChecked) {
                allCheckbox.checked = true;
            }
        }
        
        updateButtonText(containerId);
        
        // Trigger update after a short delay to ensure state is updated
        setTimeout(() => {
            console.log('Triggering component updates after checkbox change');
            const selectedGems = getSelectedValues('gemsFilterContainer');
            console.log('Selected GEMs after change:', selectedGems);
            updateAllComponents();
        }, 50);
    }

    function updateButtonText(containerId) {
        const container = document.getElementById(containerId);
        const button = container.querySelector('.multiselect-button .selected-text');
        const selected = getSelectedValues(containerId);
        
        if (selected.includes('all')) {
            if (containerId === 'gemsFilterContainer') {
                button.textContent = 'All GEMs';
            } else {
                button.textContent = 'All Categories';
            }
        } else if (selected.length === 1) {
            const checkbox = container.querySelector(`input[value="${selected[0]}"]`);
            const label = container.querySelector(`label[for="${checkbox.id}"]`);
            button.textContent = label.textContent;
        } else {
            button.textContent = `${selected.length} items selected`;
        }
    }

    function initializeCustomMultiSelect(containerId) {
        const container = document.getElementById(containerId);
        const button = container.querySelector('.multiselect-button');
        const dropdown = container.querySelector('.multiselect-dropdown');
        const checkboxes = container.querySelectorAll('input[type="checkbox"]');
        
        // Toggle dropdown on button click
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = dropdown.classList.contains('open');
            
            // Close all other dropdowns
            document.querySelectorAll('.multiselect-dropdown.open').forEach(dd => {
                dd.classList.remove('open');
                dd.parentNode.querySelector('.multiselect-button').classList.remove('open');
            });
            
            // Toggle current dropdown
            if (!isOpen) {
                dropdown.classList.add('open');
                button.classList.add('open');
            }
        });
        
        // Handle checkbox changes
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                handleCheckboxChange(containerId, checkbox);
            });
        });
        
        // Prevent dropdown close when clicking inside
        dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // Initialize button text
        updateButtonText(containerId);
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.multiselect-dropdown.open').forEach(dd => {
            dd.classList.remove('open');
            dd.parentNode.querySelector('.multiselect-button').classList.remove('open');
        });
    });

    function updateAllComponents() {
        updateFinOpsMetrics();
        updateBudgetChart();
        updateYoYTable();
        updateAIOverviewTable();
        updateCategoryOverviewTable();
        updateGEMSummaryTable();
    }

    function initializeFinOpsFilters() {
        const fiscalYearFilter = document.getElementById('fiscalYearFilter');
        const gemsFilter = document.getElementById('gemsFilter');
        const categoriesFilter = document.getElementById('categoriesFilter');

        if (fiscalYearFilter) {
            fiscalYearFilter.addEventListener('change', updateAllComponents);
        }
        
        // Initialize custom multi-selects
        initializeCustomMultiSelect('gemsFilterContainer');
        initializeCustomMultiSelect('categoriesFilterContainer');
        
        // Add change listeners to checkboxes
        const gemsContainer = document.getElementById('gemsFilterContainer');
        const categoriesContainer = document.getElementById('categoriesFilterContainer');
        
        if (gemsContainer) {
            gemsContainer.addEventListener('change', updateAllComponents);
        }
        
        if (categoriesContainer) {
            categoriesContainer.addEventListener('change', updateAllComponents);
        }        // Initialize budget chart and all tables with a slight delay to ensure finOpsData is available
        setTimeout(() => {
            console.log('Initializing FinOps components...');
            console.log('GEM Summary Container found:', document.getElementById('gemSummaryContainer'));
            console.log('GEM Summary Body found:', document.getElementById('gemSummaryBody'));
            initializeBudgetChart();
            updateAllComponents();
        }, 200);
    }
    
    // Simulated data for different filter combinations
    const finOpsData = {
        'FY26': {
            'all': {
                'all': {
                    prevYearTarget: '$736.95M', prevYearActual: '$736.95M', prevYearDelta: '$0',
                    currentYearTarget: '$835.95M', currentYearActual: '$348.7M',
                    forecastRemaining: '$576.03M', forecastTotal: '$924.73M', currentYearDelta: '$88.78M'
                },
                'compute': {
                    prevYearTarget: '$421.53M', prevYearActual: '$418.92M', prevYearDelta: '$2.61M',
                    currentYearTarget: '$478.35M', currentYearActual: '$199.2M',
                    forecastRemaining: '$329.18M', forecastTotal: '$528.38M', currentYearDelta: '-$50.03M'
                },
                'storage': {
                    prevYearTarget: '$147.39M', prevYearActual: '$151.23M', prevYearDelta: '-$3.84M',
                    currentYearTarget: '$167.19M', currentYearActual: '$69.7M',
                    forecastRemaining: '$115.21M', forecastTotal: '$184.91M', currentYearDelta: '-$17.72M'
                },
                'networking': {
                    prevYearTarget: '$73.70M', prevYearActual: '$70.15M', prevYearDelta: '$3.55M',
                    currentYearTarget: '$83.60M', currentYearActual: '$34.85M',
                    forecastRemaining: '$57.60M', forecastTotal: '$92.45M', currentYearDelta: '-$8.85M'
                },
                'database': {
                    prevYearTarget: '$66.33M', prevYearActual: '$68.91M', prevYearDelta: '-$2.58M',
                    currentYearTarget: '$75.26M', currentYearActual: '$31.35M',
                    forecastRemaining: '$51.84M', forecastTotal: '$83.19M', currentYearDelta: '-$7.93M'
                },
                'analytics': {
                    prevYearTarget: '$28.00M', prevYearActual: '$27.74M', prevYearDelta: '$0.26M',
                    currentYearTarget: '$31.75M', currentYearActual: '$13.25M',
                    forecastRemaining: '$22.20M', forecastTotal: '$35.45M', currentYearDelta: '-$3.70M'
                }
            },
            'azure': {
                'all': {
                    prevYearTarget: '$294.78M', prevYearActual: '$289.34M', prevYearDelta: '$5.44M',
                    currentYearTarget: '$334.38M', currentYearActual: '$139.42M',
                    forecastRemaining: '$230.56M', forecastTotal: '$369.98M', currentYearDelta: '-$35.60M'
                },
                'compute': {
                    prevYearTarget: '$176.87M', prevYearActual: '$173.60M', prevYearDelta: '$3.27M',
                    currentYearTarget: '$200.63M', currentYearActual: '$83.65M',
                    forecastRemaining: '$138.34M', forecastTotal: '$221.99M', currentYearDelta: '-$21.36M'
                },
                'storage': {
                    prevYearTarget: '$58.96M', prevYearActual: '$57.87M', prevYearDelta: '$1.09M',
                    currentYearTarget: '$66.88M', currentYearActual: '$27.88M',
                    forecastRemaining: '$46.11M', forecastTotal: '$73.99M', currentYearDelta: '-$7.11M'
                },
                'networking': {
                    prevYearTarget: '$29.48M', prevYearActual: '$28.93M', prevYearDelta: '$0.55M',
                    currentYearTarget: '$33.44M', currentYearActual: '$13.94M',
                    forecastRemaining: '$23.06M', forecastTotal: '$37.00M', currentYearDelta: '-$3.56M'
                },
                'database': {
                    prevYearTarget: '$23.58M', prevYearActual: '$23.15M', prevYearDelta: '$0.43M',
                    currentYearTarget: '$26.75M', currentYearActual: '$11.15M',
                    forecastRemaining: '$18.45M', forecastTotal: '$29.60M', currentYearDelta: '-$2.85M'
                },
                'analytics': {
                    prevYearTarget: '$5.89M', prevYearActual: '$5.79M', prevYearDelta: '$0.10M',
                    currentYearTarget: '$6.68M', currentYearActual: '$2.78M',
                    forecastRemaining: '$4.61M', forecastTotal: '$7.39M', currentYearDelta: '-$0.71M'
                }
            },
            'substrate': {
                'all': {
                    prevYearTarget: '$442.17M', prevYearActual: '$447.61M', prevYearDelta: '-$5.44M',
                    currentYearTarget: '$501.57M', currentYearActual: '$209.28M',
                    forecastRemaining: '$345.47M', forecastTotal: '$554.75M', currentYearDelta: '-$53.18M'
                },
                'compute': {
                    prevYearTarget: '$244.19M', prevYearActual: '$246.18M', prevYearDelta: '-$1.99M',
                    currentYearTarget: '$275.86M', currentYearActual: '$115.12M',
                    forecastRemaining: '$190.34M', forecastTotal: '$305.46M', currentYearDelta: '-$29.60M'
                },
                'storage': {
                    prevYearTarget: '$88.43M', prevYearActual: '$89.52M', prevYearDelta: '-$1.09M',
                    currentYearTarget: '$100.31M', currentYearActual: '$41.82M',
                    forecastRemaining: '$69.09M', forecastTotal: '$110.91M', currentYearDelta: '-$10.60M'
                },
                'networking': {
                    prevYearTarget: '$44.22M', prevYearActual: '$44.76M', prevYearDelta: '-$0.54M',
                    currentYearTarget: '$50.16M', currentYearActual: '$20.93M',
                    forecastRemaining: '$34.55M', forecastTotal: '$55.48M', currentYearDelta: '-$5.32M'
                },
                'database': {
                    prevYearTarget: '$42.75M', prevYearActual: '$44.76M', prevYearDelta: '-$2.01M',
                    currentYearTarget: '$48.51M', currentYearActual: '$20.23M',
                    forecastRemaining: '$33.38M', forecastTotal: '$53.61M', currentYearDelta: '-$5.10M'
                },
                'analytics': {
                    prevYearTarget: '$22.11M', prevYearActual: '$21.95M', prevYearDelta: '$0.16M',
                    currentYearTarget: '$25.07M', currentYearActual: '$10.46M',
                    forecastRemaining: '$17.26M', forecastTotal: '$27.72M', currentYearDelta: '-$2.65M'
                }
            },
            'office': {
                'all': {
                    prevYearTarget: '$110.00M', prevYearActual: '$115.20M', prevYearDelta: '-$5.20M',
                    currentYearTarget: '$125.00M', currentYearActual: '$52.08M',
                    forecastRemaining: '$86.15M', forecastTotal: '$138.23M', currentYearDelta: '-$13.23M'
                },
                'compute': {
                    prevYearTarget: '$49.50M', prevYearActual: '$51.84M', prevYearDelta: '-$2.34M',
                    currentYearTarget: '$56.25M', currentYearActual: '$23.44M',
                    forecastRemaining: '$38.77M', forecastTotal: '$62.21M', currentYearDelta: '-$5.96M'
                },
                'storage': {
                    prevYearTarget: '$22.00M', prevYearActual: '$23.04M', prevYearDelta: '-$1.04M',
                    currentYearTarget: '$25.00M', currentYearActual: '$10.42M',
                    forecastRemaining: '$17.23M', forecastTotal: '$27.65M', currentYearDelta: '-$2.65M'
                },
                'networking': {
                    prevYearTarget: '$16.50M', prevYearActual: '$17.28M', prevYearDelta: '-$0.78M',
                    currentYearTarget: '$18.75M', currentYearActual: '$7.81M',
                    forecastRemaining: '$12.92M', forecastTotal: '$20.73M', currentYearDelta: '-$1.98M'
                },
                'database': {
                    prevYearTarget: '$11.00M', prevYearActual: '$11.52M', prevYearDelta: '-$0.52M',
                    currentYearTarget: '$12.50M', currentYearActual: '$5.21M',
                    forecastRemaining: '$8.61M', forecastTotal: '$13.82M', currentYearDelta: '-$1.32M'
                },
                'analytics': {
                    prevYearTarget: '$38.50M', prevYearActual: '$40.32M', prevYearDelta: '-$1.82M',
                    currentYearTarget: '$43.75M', currentYearActual: '$18.22M',
                    forecastRemaining: '$30.15M', forecastTotal: '$48.37M', currentYearDelta: '-$4.62M'
                }
            },
            'dynamics': {
                'all': {
                    prevYearTarget: '$58.32M', prevYearActual: '$60.17M', prevYearDelta: '-$1.85M',
                    currentYearTarget: '$66.22M', currentYearActual: '$27.61M',
                    forecastRemaining: '$45.65M', forecastTotal: '$73.26M', currentYearDelta: '-$7.04M'
                },
                'compute': {
                    prevYearTarget: '$26.24M', prevYearActual: '$27.08M', prevYearDelta: '-$0.84M',
                    currentYearTarget: '$29.80M', currentYearActual: '$12.42M',
                    forecastRemaining: '$20.54M', forecastTotal: '$32.96M', currentYearDelta: '-$3.16M'
                },
                'storage': {
                    prevYearTarget: '$8.75M', prevYearActual: '$9.03M', prevYearDelta: '-$0.28M',
                    currentYearTarget: '$9.93M', currentYearActual: '$4.14M',
                    forecastRemaining: '$6.85M', forecastTotal: '$10.99M', currentYearDelta: '-$1.06M'
                },
                'networking': {
                    prevYearTarget: '$5.83M', prevYearActual: '$6.02M', prevYearDelta: '-$0.19M',
                    currentYearTarget: '$6.62M', currentYearActual: '$2.76M',
                    forecastRemaining: '$4.57M', forecastTotal: '$7.33M', currentYearDelta: '-$0.71M'
                },
                'database': {
                    prevYearTarget: '$20.41M', prevYearActual: '$21.06M', prevYearDelta: '-$0.65M',
                    currentYearTarget: '$23.18M', currentYearActual: '$9.66M',
                    forecastRemaining: '$15.98M', forecastTotal: '$25.64M', currentYearDelta: '-$2.46M'
                },
                'analytics': {
                    prevYearTarget: '$11.67M', prevYearActual: '$12.03M', prevYearDelta: '-$0.36M',
                    currentYearTarget: '$13.24M', currentYearActual: '$5.52M',
                    forecastRemaining: '$9.13M', forecastTotal: '$14.65M', currentYearDelta: '-$1.41M'
                }
            }
        },
        'FY25': {
            'all': {
                'all': {
                    prevYearTarget: '$685.42M', prevYearActual: '$692.18M', prevYearDelta: '-$6.76M',
                    currentYearTarget: '$736.95M', currentYearActual: '$736.95M',
                    forecastRemaining: '$0', forecastTotal: '$736.95M', currentYearDelta: '$0'
                },
                'compute': {
                    prevYearTarget: '$390.94M', prevYearActual: '$394.74M', prevYearDelta: '-$3.80M',
                    currentYearTarget: '$421.53M', currentYearActual: '$418.92M',
                    forecastRemaining: '$0', forecastTotal: '$418.92M', currentYearDelta: '$2.61M'
                },
                'storage': {
                    prevYearTarget: '$137.08M', prevYearActual: '$138.44M', prevYearDelta: '-$1.36M',
                    currentYearTarget: '$147.39M', currentYearActual: '$151.23M',
                    forecastRemaining: '$0', forecastTotal: '$151.23M', currentYearDelta: '-$3.84M'
                }
            },
            'azure': {
                'all': {
                    prevYearTarget: '$274.05M', prevYearActual: '$276.87M', prevYearDelta: '-$2.82M',
                    currentYearTarget: '$294.78M', currentYearActual: '$289.34M',
                    forecastRemaining: '$0', forecastTotal: '$289.34M', currentYearDelta: '$5.44M'
                }
            }
        },
        'FY24': {
            'all': {
                'all': {
                    prevYearTarget: '$612.33M', prevYearActual: '$628.91M', prevYearDelta: '-$16.58M',
                    currentYearTarget: '$685.42M', currentYearActual: '$692.18M',
                    forecastRemaining: '$0', forecastTotal: '$692.18M', currentYearDelta: '-$6.76M'
                }
            }
        }
    };
    
    function updateFinOpsMetrics() {
        const fiscalYear = document.getElementById('fiscalYearFilter')?.value || 'FY26';
        const gemsArray = getSelectedValues('gemsFilterContainer');
        const categoriesArray = getSelectedValues('categoriesFilterContainer');
        const gems = gemsArray.includes('all') ? 'all' : gemsArray[0] || 'all';
        const categories = categoriesArray.includes('all') ? 'all' : categoriesArray[0] || 'all';
        
        // Add loading effect
        const metricsContainer = document.getElementById('finopsMetrics');
        if (metricsContainer) {
            metricsContainer.classList.add('loading');
        }
        
        // Simulate brief loading delay for realistic effect
        setTimeout(() => {
            // Get data for the selected filters - try specific combination first, then fallbacks
            let data = finOpsData[fiscalYear]?.[gems]?.[categories];
            
            // Fallback logic: try gems + all categories if specific category not found
            if (!data && categories !== 'all') {
                data = finOpsData[fiscalYear]?.[gems]?.['all'];
            }
            
            // Fallback logic: try all gems + specific category if gems not found
            if (!data && gems !== 'all') {
                data = finOpsData[fiscalYear]?.['all']?.[categories];
            }
            
            // Final fallback: all + all for the fiscal year
            if (!data) {
                data = finOpsData[fiscalYear]?.['all']?.['all'];
            }
            
            // Ultimate fallback: FY26 all + all
            if (!data) {
                data = finOpsData['FY26']['all']['all'];
            }
        
        // Update labels based on fiscal year
        const prevYear = fiscalYear === 'FY26' ? 'FY25' : fiscalYear === 'FY25' ? 'FY24' : 'FY23';
        const currentYear = fiscalYear;
        
        // Update metric labels
        document.getElementById('prevYearTargetLabel').textContent = `${prevYear} Target`;
        document.getElementById('prevYearActualLabel').textContent = `${prevYear} Actual Total`;
        document.getElementById('prevYearDeltaLabel').textContent = `${prevYear} Delta`;
        document.getElementById('currentYearTargetLabel').textContent = `${currentYear} Target`;
        document.getElementById('currentYearActualLabel').textContent = `${currentYear} Actual Current`;
        document.getElementById('forecastRemainingLabel').textContent = `${currentYear} Forecast Remaining`;
        document.getElementById('forecastTotalLabel').textContent = `${currentYear} Forecast Total`;
        document.getElementById('currentYearDeltaLabel').textContent = `${currentYear} Delta`;
        
        // Update metric values
        document.getElementById('prevYearTarget').textContent = data.prevYearTarget;
        document.getElementById('prevYearActual').textContent = data.prevYearActual;
        document.getElementById('prevYearDelta').textContent = data.prevYearDelta;
        document.getElementById('currentYearTarget').textContent = data.currentYearTarget;
        document.getElementById('currentYearActual').textContent = data.currentYearActual;
        document.getElementById('forecastRemaining').textContent = data.forecastRemaining;
        document.getElementById('forecastTotal').textContent = data.forecastTotal;
        document.getElementById('currentYearDelta').textContent = data.currentYearDelta;
        
        // Apply styling for negative values
        const deltaElements = [
            document.getElementById('prevYearDelta'),
            document.getElementById('currentYearDelta')
        ];
        
        deltaElements.forEach(element => {
            if (element.textContent.startsWith('-')) {
                element.classList.add('negative');
            } else {
                element.classList.remove('negative');
            }
        });
        
        // Remove loading effect
        if (metricsContainer) {
            metricsContainer.classList.remove('loading');
        }
        }, 300); // 300ms loading delay for realistic effect
    }

    // Initialize Substrate Charts
    function initializeSubstrateCharts() {
        // Donut Chart - Substrate Cost by Metrics
        const donutCtx = document.getElementById('substrateDonutChart');
        if (donutCtx && !donutCtx.chart) {
            donutCtx.chart = new Chart(donutCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Transaction Item-Reads', 'Transaction Item-Writes', 'Transaction Item-Queries', 'Process Hosting', 'Network', 'HDD-Storage', 'SSD-Storage', 'SSD-Storage InfCache'],
                    datasets: [{
                        data: [56.81, 14.0, 3.46, 2.21, 2.01, 8.38, 5.55, 7.58],
                        backgroundColor: [
                            '#8B4789',
                            '#C24C9C',
                            '#D94F9E',
                            '#CC7AB4',
                            '#E89EC4',
                            '#F4C9DB',
                            '#FFE4F0',
                            '#B8B8B8'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                boxWidth: 12,
                                padding: 10,
                                font: {
                                    size: 11
                                }
                            }
                        }
                    }
                }
            });
        }

        // Trends Chart
        const trendsCtx = document.getElementById('substrateTrendsChart');
        if (trendsCtx && !trendsCtx.chart) {
            trendsCtx.chart = new Chart(trendsCtx, {
                type: 'line',
                data: {
                    labels: ['08/26', '09/26', '09/29', '10/02', '10/05', '10/08', '10/11', '10/14', '10/17', '11/01', '11/15', '12/01', '12/15', '12/31'],
                    datasets: [
                        {
                            label: 'Total Cost',
                            data: [520, 525, 530, 528, 532, 535, 540, 545, 542, 538, 536, 534, 532, 530],
                            borderColor: '#0078d4',
                            backgroundColor: 'rgba(0, 120, 212, 0.1)',
                            tension: 0.4
                        },
                        {
                            label: 'Average Cost',
                            data: [500, 502, 505, 508, 510, 512, 515, 518, 520, 522, 524, 526, 528, 530],
                            borderColor: '#40e0d0',
                            backgroundColor: 'rgba(64, 224, 208, 0.1)',
                            borderDash: [5, 5],
                            tension: 0.4
                        },
                        {
                            label: 'Anomaly Detection',
                            data: [null, null, null, null, null, null, null, null, null, null, null, null, null, 545],
                            borderColor: '#ff6b6b',
                            backgroundColor: 'rgba(255, 107, 107, 0.3)',
                            pointRadius: 6,
                            pointStyle: 'circle'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            ticks: {
                                callback: function(value) {
                                    return '$' + value + 'M';
                                }
                            }
                        }
                    }
                }
            });
        }

        // Category Trends Chart
        const categoryCtx = document.getElementById('substrateCategoryChart');
        if (categoryCtx && !categoryCtx.chart) {
            categoryCtx.chart = new Chart(categoryCtx, {
                type: 'line',
                data: {
                    labels: ['08/26', '09/26', '09/29', '10/02', '10/05', '10/08', '10/11', '10/14', '10/17', '11/01', '11/15', '12/01'],
                    datasets: [
                        {
                            label: 'Transaction Item-Reads',
                            data: [300, 305, 310, 308, 312, 315, 320, 325, 322, 318, 320, 322],
                            borderColor: '#8B4789',
                            tension: 0.4
                        },
                        {
                            label: 'Transaction Item-Writes',
                            data: [80, 82, 85, 88, 90, 92, 95, 98, 100, 102, 104, 105],
                            borderColor: '#C24C9C',
                            tension: 0.4
                        },
                        {
                            label: 'Process Hosting',
                            data: [50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61],
                            borderColor: '#CC7AB4',
                            tension: 0.4
                        },
                        {
                            label: 'Network',
                            data: [40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51],
                            borderColor: '#E89EC4',
                            tension: 0.4
                        },
                        {
                            label: 'Anomaly Detection',
                            data: [null, null, null, null, null, null, null, null, null, null, null, 450],
                            borderColor: '#ff6b6b',
                            pointRadius: 6
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                boxWidth: 12,
                                padding: 8,
                                font: {
                                    size: 10
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            ticks: {
                                callback: function(value) {
                                    return '$' + value + 'M';
                                }
                            }
                        }
                    }
                }
            });
        }

        // Monthly Trends Chart
        const monthlyCtx = document.getElementById('substrateMonthlyChart');
        if (monthlyCtx && !monthlyCtx.chart) {
            monthlyCtx.chart = new Chart(monthlyCtx, {
                type: 'bar',
                data: {
                    labels: ['Aug', 'Sep', 'Oct'],
                    datasets: [
                        {
                            label: 'Transaction Item-Reads',
                            data: [15, 16, 17],
                            backgroundColor: '#8B4789'
                        },
                        {
                            label: 'Transaction Item-Writes',
                            data: [12, 13, 14],
                            backgroundColor: '#C24C9C'
                        },
                        {
                            label: 'Transaction Item-Queries',
                            data: [8, 9, 10],
                            backgroundColor: '#D94F9E'
                        },
                        {
                            label: 'Process Hosting',
                            data: [5, 6, 7],
                            backgroundColor: '#CC7AB4'
                        },
                        {
                            label: 'Network',
                            data: [3, 4, 5],
                            backgroundColor: '#E89EC4'
                        },
                        {
                            label: 'HDD-Storage',
                            data: [2, 3, 4],
                            backgroundColor: '#F4C9DB'
                        },
                        {
                            label: 'SSD-Storage',
                            data: [2, 2, 3],
                            backgroundColor: '#FFE4F0'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                boxWidth: 10,
                                padding: 6,
                                font: {
                                    size: 10
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            stacked: true
                        },
                        y: {
                            stacked: true,
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '$' + value + 'M';
                                }
                            }
                        }
                    }
                }
            });
        }

        // Deployment Rings Chart
        const ringsCtx = document.getElementById('substrateRingsChart');
        if (ringsCtx && !ringsCtx.chart) {
            ringsCtx.chart = new Chart(ringsCtx, {
                type: 'line',
                data: {
                    labels: ['08/26', '09/26', '10/05', '10/15', '11/01', '11/15', '12/01', '12/15', '12/31'],
                    datasets: [
                        {
                            label: 'EDPV2',
                            data: [380, 385, 390, 395, 400, 405, 410, 415, 420],
                            borderColor: '#0078d4',
                            tension: 0.4
                        },
                        {
                            label: 'MRSP',
                            data: [90, 92, 95, 98, 100, 102, 105, 108, 110],
                            borderColor: '#00bcf2',
                            tension: 0.4
                        },
                        {
                            label: 'SIP',
                            data: [30, 32, 35, 38, 40, 42, 45, 48, 50],
                            borderColor: '#40e0d0',
                            tension: 0.4
                        },
                        {
                            label: 'WW',
                            data: [20, 22, 25, 28, 30, 32, 35, 38, 40],
                            borderColor: '#ffa500',
                            tension: 0.4
                        },
                        {
                            label: 'Anomaly Detection',
                            data: [null, null, null, null, null, null, null, null, 450],
                            borderColor: '#ff6b6b',
                            pointRadius: 6
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            ticks: {
                                callback: function(value) {
                                    return '$' + value + 'M';
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    // Initialize Azure Charts
    function initializeAzureCharts() {
        // Donut Chart - Azure Cost by Service
        const donutCtx = document.getElementById('azureDonutChart');
        if (donutCtx && !donutCtx.chart) {
            donutCtx.chart = new Chart(donutCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Public Compute', 'Storage Services', 'Networking', 'Database Services', 'AzSC Compute', 'Other Services'],
                    datasets: [{
                        data: [43.9, 23.9, 12.1, 10.2, 3.7, 6.2],
                        backgroundColor: ['#0078d4', '#00bcf2', '#40e0d0', '#8764b8', '#107c10', '#ff8c00']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: { position: 'right', labels: { boxWidth: 12, padding: 10, font: { size: 11 } } }
                    }
                }
            });
        }

        // Trends Chart
        const trendsCtx = document.getElementById('azureTrendsChart');
        if (trendsCtx && !trendsCtx.chart) {
            trendsCtx.chart = new Chart(trendsCtx, {
                type: 'line',
                data: {
                    labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
                    datasets: [
                        { label: 'Total Cost', data: [320, 328, 335, 342, 350, 355, 362, 368, 372, 378, 382, 374], borderColor: '#0078d4', tension: 0.4 },
                        { label: 'Budget', data: [330, 335, 340, 345, 350, 355, 360, 365, 370, 375, 380, 385], borderColor: '#107c10', borderDash: [5, 5], tension: 0.4 }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: true,
                    plugins: { legend: { position: 'bottom' } },
                    scales: { y: { beginAtZero: false, ticks: { callback: function(value) { return '$' + value + 'M'; } } } }
                }
            });
        }

        // Category Trends Chart
        const categoryCtx = document.getElementById('azureCategoryChart');
        if (categoryCtx && !categoryCtx.chart) {
            categoryCtx.chart = new Chart(categoryCtx, {
                type: 'line',
                data: {
                    labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
                    datasets: [
                        { label: 'Compute', data: [140, 145, 148, 152, 156, 158, 162, 165, 168, 172, 175, 164], borderColor: '#0078d4', tension: 0.4 },
                        { label: 'Storage', data: [75, 78, 80, 83, 86, 88, 90, 92, 94, 96, 98, 89], borderColor: '#00bcf2', tension: 0.4 },
                        { label: 'Network', data: [38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 45], borderColor: '#40e0d0', tension: 0.4 },
                        { label: 'Database', data: [32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 38], borderColor: '#8764b8', tension: 0.4 }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: true,
                    plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 8, font: { size: 10 } } } },
                    scales: { y: { beginAtZero: false, ticks: { callback: function(value) { return '$' + value + 'M'; } } } }
                }
            });
        }

        // Monthly Chart
        const monthlyCtx = document.getElementById('azureMonthlyChart');
        if (monthlyCtx && !monthlyCtx.chart) {
            monthlyCtx.chart = new Chart(monthlyCtx, {
                type: 'bar',
                data: {
                    labels: ['Dec', 'Jan', 'Feb'],
                    datasets: [
                        { label: 'Compute', data: [172, 175, 164], backgroundColor: '#0078d4' },
                        { label: 'Storage', data: [96, 98, 89], backgroundColor: '#00bcf2' },
                        { label: 'Network', data: [56, 58, 45], backgroundColor: '#40e0d0' },
                        { label: 'Database', data: [50, 52, 38], backgroundColor: '#8764b8' }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: true,
                    plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 6, font: { size: 10 } } } },
                    scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true, ticks: { callback: function(value) { return '$' + value + 'M'; } } } }
                }
            });
        }

        // Region Chart
        const regionCtx = document.getElementById('azureRegionChart');
        if (regionCtx && !regionCtx.chart) {
            regionCtx.chart = new Chart(regionCtx, {
                type: 'bar',
                data: {
                    labels: ['West US 2', 'East US 2', 'Central US', 'West Europe', 'Southeast Asia'],
                    datasets: [{ label: 'Cost by Region', data: [142, 98, 72, 38, 24], backgroundColor: ['#0078d4', '#00bcf2', '#40e0d0', '#8764b8', '#107c10'] }]
                },
                options: {
                    responsive: true, maintainAspectRatio: true, indexAxis: 'y',
                    plugins: { legend: { display: false } },
                    scales: { x: { beginAtZero: true, ticks: { callback: function(value) { return '$' + value + 'M'; } } } }
                }
            });
        }
    }

    // Initialize COSMIC Charts
    function initializeCosmicCharts() {
        // Donut Chart
        const donutCtx = document.getElementById('cosmicDonutChart');
        if (donutCtx && !donutCtx.chart) {
            donutCtx.chart = new Chart(donutCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Search Index', 'Query Processing', 'Data Ingestion', 'Storage', 'ML Processing', 'Security'],
                    datasets: [{
                        data: [38.7, 27.3, 19.6, 9.6, 3.2, 1.6],
                        backgroundColor: ['#0078d4', '#00bcf2', '#40e0d0', '#8764b8', '#107c10', '#ff8c00']
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: true,
                    plugins: { legend: { position: 'right', labels: { boxWidth: 12, padding: 10, font: { size: 11 } } } }
                }
            });
        }

        // Trends Chart
        const trendsCtx = document.getElementById('cosmicTrendsChart');
        if (trendsCtx && !trendsCtx.chart) {
            trendsCtx.chart = new Chart(trendsCtx, {
                type: 'line',
                data: {
                    labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
                    datasets: [
                        { label: 'Total Cost', data: [28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 38.31], borderColor: '#0078d4', tension: 0.4 },
                        { label: 'Projected', data: [28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 40], borderColor: '#ff8c00', borderDash: [5, 5], tension: 0.4 }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: true,
                    plugins: { legend: { position: 'bottom' } },
                    scales: { y: { beginAtZero: false, ticks: { callback: function(value) { return '$' + value + 'M'; } } } }
                }
            });
        }

        // Category Trends
        const categoryCtx = document.getElementById('cosmicCategoryChart');
        if (categoryCtx && !categoryCtx.chart) {
            categoryCtx.chart = new Chart(categoryCtx, {
                type: 'line',
                data: {
                    labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
                    datasets: [
                        { label: 'Search Index', data: [10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 14.8, 14.82], borderColor: '#0078d4', tension: 0.4 },
                        { label: 'Query Processing', data: [7, 7.3, 7.6, 7.9, 8.2, 8.5, 8.8, 9.2, 9.6, 10, 10.3, 10.45], borderColor: '#00bcf2', tension: 0.4 },
                        { label: 'Data Ingestion', data: [5, 5.2, 5.4, 5.7, 6, 6.3, 6.6, 7, 7.2, 7.4, 7.5, 7.52], borderColor: '#40e0d0', tension: 0.4 }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: true,
                    plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 8, font: { size: 10 } } } },
                    scales: { y: { beginAtZero: false, ticks: { callback: function(value) { return '$' + value + 'M'; } } } }
                }
            });
        }

        // Query Chart
        const queryCtx = document.getElementById('cosmicQueryChart');
        if (queryCtx && !queryCtx.chart) {
            queryCtx.chart = new Chart(queryCtx, {
                type: 'line',
                data: {
                    labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
                    datasets: [
                        { label: 'Query Volume (B)', data: [1.8, 1.9, 2.0, 2.1, 2.2, 2.25, 2.3, 2.35, 2.38, 2.4, 2.42, 2.4], borderColor: '#0078d4', tension: 0.4, yAxisID: 'y' },
                        { label: 'Cost per Query ($)', data: [3.8, 3.9, 4.0, 4.1, 4.2, 4.3, 4.35, 4.4, 4.42, 4.45, 4.48, 4.35], borderColor: '#ff8c00', tension: 0.4, yAxisID: 'y1' }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: true,
                    plugins: { legend: { position: 'bottom' } },
                    scales: { y: { beginAtZero: false, position: 'left' }, y1: { beginAtZero: false, position: 'right', grid: { drawOnChartArea: false } } }
                }
            });
        }

        // Index Chart
        const indexCtx = document.getElementById('cosmicIndexChart');
        if (indexCtx && !indexCtx.chart) {
            indexCtx.chart = new Chart(indexCtx, {
                type: 'bar',
                data: {
                    labels: ['Enterprise', 'People', 'Content', 'Graph'],
                    datasets: [
                        { label: 'Storage (TB)', data: [280, 85, 320, 120], backgroundColor: '#0078d4' },
                        { label: 'Cost ($M)', data: [8.92, 4.52, 7.84, 5.12], backgroundColor: '#00bcf2' }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: true,
                    plugins: { legend: { position: 'bottom' } },
                    scales: { y: { beginAtZero: true } }
                }
            });
        }
    }

    // Initialize Telemetry Charts
    function initializeTelemetryCharts() {
        // Donut Chart
        const donutCtx = document.getElementById('telemetryDonutChart');
        if (donutCtx && !donutCtx.chart) {
            donutCtx.chart = new Chart(donutCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Kusto (ADX)', 'Cosmos', 'Geneva MDS', 'Blueshift', 'Geneva MDM', 'Aria', 'Passive Monitoring'],
                    datasets: [{
                        data: [42.2, 32.4, 12.4, 6.0, 5.4, 1.6, 0],
                        backgroundColor: ['#0078d4', '#00bcf2', '#40e0d0', '#8764b8', '#107c10', '#ff8c00', '#d13438']
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: true,
                    plugins: { legend: { position: 'right', labels: { boxWidth: 12, padding: 10, font: { size: 11 } } } }
                }
            });
        }

        // Trends Chart
        const trendsCtx = document.getElementById('telemetryTrendsChart');
        if (trendsCtx && !trendsCtx.chart) {
            trendsCtx.chart = new Chart(trendsCtx, {
                type: 'line',
                data: {
                    labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
                    datasets: [
                        { label: 'Total Cost', data: [48, 50, 52, 54, 56, 58, 60, 61, 62, 63, 64, 64.08], borderColor: '#0078d4', tension: 0.4 },
                        { label: 'Budget', data: [50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72], borderColor: '#107c10', borderDash: [5, 5], tension: 0.4 }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: true,
                    plugins: { legend: { position: 'bottom' } },
                    scales: { y: { beginAtZero: false, ticks: { callback: function(value) { return '$' + value + 'M'; } } } }
                }
            });
        }

        // Category Trends
        const categoryCtx = document.getElementById('telemetryCategoryChart');
        if (categoryCtx && !categoryCtx.chart) {
            categoryCtx.chart = new Chart(categoryCtx, {
                type: 'line',
                data: {
                    labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
                    datasets: [
                        { label: 'Kusto', data: [18, 19, 20, 21, 22, 23, 24, 25, 26, 26.5, 27, 27.05], borderColor: '#0078d4', tension: 0.4 },
                        { label: 'Cosmos', data: [14, 15, 16, 17, 17.5, 18, 19, 19.5, 20, 20.5, 20.75, 20.75], borderColor: '#00bcf2', tension: 0.4 },
                        { label: 'Geneva MDS', data: [5, 5.5, 6, 6.5, 7, 7.2, 7.5, 7.7, 7.8, 7.9, 7.92, 7.92], borderColor: '#40e0d0', tension: 0.4 },
                        { label: 'Blueshift', data: [2.5, 2.7, 2.9, 3.1, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.82, 3.82], borderColor: '#8764b8', tension: 0.4 }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: true,
                    plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 8, font: { size: 10 } } } },
                    scales: { y: { beginAtZero: false, ticks: { callback: function(value) { return '$' + value + 'M'; } } } }
                }
            });
        }

        // Ingestion Chart
        const ingestionCtx = document.getElementById('telemetryIngestionChart');
        if (ingestionCtx && !ingestionCtx.chart) {
            ingestionCtx.chart = new Chart(ingestionCtx, {
                type: 'line',
                data: {
                    labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
                    datasets: [
                        { label: 'Data Volume (TB/day)', data: [6.5, 6.8, 7.1, 7.4, 7.7, 8.0, 8.2, 8.4, 8.5, 8.6, 8.7, 8.5], borderColor: '#0078d4', tension: 0.4 },
                        { label: 'Cost per TB ($K)', data: [18, 18.5, 19, 19.5, 20, 20.2, 20.5, 20.8, 21, 21.2, 21.5, 21.4], borderColor: '#ff8c00', tension: 0.4 }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: true,
                    plugins: { legend: { position: 'bottom' } },
                    scales: { y: { beginAtZero: false } }
                }
            });
        }

        // Storage Chart
        const storageCtx = document.getElementById('telemetryStorageChart');
        if (storageCtx && !storageCtx.chart) {
            storageCtx.chart = new Chart(storageCtx, {
                type: 'bar',
                data: {
                    labels: ['Kusto', 'Cosmos', 'Geneva', 'Blueshift', 'MDM'],
                    datasets: [
                        { label: 'Query Cost', data: [6.5, 4.2, 2.8, 1.2, 1.28], backgroundColor: '#0078d4' },
                        { label: 'Storage Cost', data: [3.8, 4.15, 1.92, 0.82, 0.8], backgroundColor: '#00bcf2' },
                        { label: 'Ingestion Cost', data: [8.2, 12.4, 3.2, 1.8, 1.4], backgroundColor: '#40e0d0' }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: true,
                    plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 6, font: { size: 10 } } } },
                    scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true, ticks: { callback: function(value) { return '$' + value + 'M'; } } } }
                }
            });
        }
    }    
});