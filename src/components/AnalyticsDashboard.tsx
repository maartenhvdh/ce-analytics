import React, { useEffect, useState, useCallback } from 'react';
import { useValue, useItemInfo, useConfig } from '../customElement/CustomElementContext';
import type { AnalyticsData } from '../customElement/value';

// Generate fake analytics data
const generateFakeAnalytics = (): AnalyticsData => {
  const now = new Date();
  const historyDays = 7;
  const pageViewsHistory = Array.from({ length: historyDays }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (historyDays - 1 - i));
    const dateString = date.toISOString().split('T')[0]!; // Always defined for valid dates
    return {
      date: dateString,
      views: Math.floor(Math.random() * 500) + 100,
    };
  });

  const totalViews = pageViewsHistory.reduce((sum, day) => sum + day.views, 0);

  return {
    pageViews: totalViews,
    uniqueVisitors: Math.floor(totalViews * (0.6 + Math.random() * 0.2)), // 60-80% of page views
    bounceRate: Math.round((20 + Math.random() * 30) * 10) / 10, // 20-50%
    avgTimeOnPage: Math.round((45 + Math.random() * 180) * 10) / 10, // 45-225 seconds
    lastUpdated: now.toISOString(),
    pageViewsHistory,
  };
};

const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
}> = ({ title, value, subtitle, trend }) => {
  const trendColor = trend !== undefined 
    ? (trend > 0 ? '#10b981' : trend < 0 ? '#ef4444' : '#6b7280')
    : '#6b7280';
  
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    }}>
      <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
        {title}
      </div>
      <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      {subtitle && (
        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
          {subtitle}
        </div>
      )}
      {trend !== undefined && trend !== 0 && (
        <div style={{ fontSize: '12px', color: trendColor, marginTop: '8px' }}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs previous period
        </div>
      )}
    </div>
  );
};

const Chart: React.FC<{ data: ReadonlyArray<{ date: string; views: number }> }> = ({ data }) => {
  const maxViews = Math.max(...data.map(d => d.views), 1);
  const chartHeight = 150;
  const barWidth = Math.max(30, (600 - (data.length * 10)) / data.length);

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    }}>
      <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>
        7-Day Page Views Trend
      </h3>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: `${chartHeight}px` }}>
        {data.map((day, index) => {
          const height = (day.views / maxViews) * chartHeight;
          const date = new Date(day.date);
          const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
          
          return (
            <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  width: `${barWidth}px`,
                  height: `${height}px`,
                  background: 'linear-gradient(to top, #3b82f6, #60a5fa)',
                  borderRadius: '4px 4px 0 0',
                  marginBottom: '8px',
                  transition: 'all 0.3s ease',
                }}
                title={`${day.date}: ${day.views} views`}
              />
              <div style={{ fontSize: '11px', color: '#6b7280', textAlign: 'center' }}>
                {dayLabel}
              </div>
              <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>
                {day.views}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const AnalyticsDashboard: React.FC = () => {
  const [value, setValue] = useValue();
  const item = useItemInfo();
  const config = useConfig();
  const [isLoading, setIsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    value?.analyticsData || null
  );

  // Load saved data or generate new
  useEffect(() => {
    if (value?.analyticsData) {
      setAnalyticsData(value.analyticsData);
    } else {
      // Generate initial fake data
      const fakeData = generateFakeAnalytics();
      setAnalyticsData(fakeData);
      setValue({ analyticsData: fakeData });
    }
  }, []);

  const refreshAnalytics = useCallback(() => {
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      const newData = generateFakeAnalytics();
      setAnalyticsData(newData);
      setValue({ analyticsData: newData });
      setIsLoading(false);
    }, 800);
  }, [setValue]);

  if (!analyticsData) {
    return <div>Loading analytics...</div>;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      padding: '24px',
      background: '#f9fafb',
      minHeight: '100%',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#111827' }}>
            Content Analytics
          </h1>
          <button
            onClick={refreshAnalytics}
            disabled={isLoading}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {isLoading ? (
              <>
                <span>🔄</span>
                <span>Refreshing...</span>
              </>
            ) : (
              <>
                <span>↻</span>
                <span>Refresh Data</span>
              </>
            )}
          </button>
        </div>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          Content Item: <strong>{item.name}</strong> ({item.codename})
        </div>
        <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
          Last updated: {new Date(analyticsData.lastUpdated).toLocaleString()}
          {config.analyticsService && ` • Simulating: ${config.analyticsService}`}
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <StatCard
          title="Page Views"
          value={analyticsData.pageViews}
          subtitle="Last 7 days"
          trend={Math.round((Math.random() - 0.3) * 20)} // Random trend between -20% and +17%
        />
        <StatCard
          title="Unique Visitors"
          value={analyticsData.uniqueVisitors}
          subtitle="Last 7 days"
          trend={Math.round((Math.random() - 0.3) * 15)}
        />
        <StatCard
          title="Bounce Rate"
          value={`${analyticsData.bounceRate}%`}
          subtitle="Lower is better"
          trend={Math.round((Math.random() - 0.5) * 10)} // Negative trend is good for bounce rate
        />
        <StatCard
          title="Avg. Time on Page"
          value={formatTime(analyticsData.avgTimeOnPage)}
          subtitle="Higher is better"
          trend={Math.round((Math.random() - 0.2) * 15)}
        />
      </div>

      {/* Chart */}
      <Chart data={analyticsData.pageViewsHistory} />

      {/* Integration Note */}
      <div style={{
        marginTop: '24px',
        padding: '16px',
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#1e40af',
      }}>
        <div style={{ fontWeight: '600', marginBottom: '4px' }}>
          💡 Integration Demo
        </div>
        <div>
          This custom element demonstrates how you could integrate real analytics services like Google Analytics, 
          Adobe Analytics, or custom tracking systems. The statistics shown are simulated, but in a real implementation, 
          you would fetch actual data from your analytics API based on the content item's URL or identifier.
        </div>
      </div>
    </div>
  );
};
