'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, AlertTriangle, CheckCircle, RefreshCw, Users, Music, BarChart3 } from 'lucide-react';

interface DashboardData {
  metrics: {
    successRate: number;
    errorRate: number;
    parseFailureRate: number;
    p95Latency: number;
    p99Latency: number;
    totalRequests: number;
    platformBreakdown: any;
    topErrorTypes: Array<{ errorType: string; count: number; percentage: number }>;
    privateLinkRate: number;
    averageTrackCount: number;
  };
  alerts: Array<{
    type: string;
    severity: 'warning' | 'critical';
    message: string;
    currentValue: number;
    threshold: number;
  }>;
  thresholds: any;
  timeWindow: number;
}

interface Playlist {
  id: string;
  title?: string;
  weekStartDate: string;
  weekEndDate: string;
  user: {
    id: string;
    name?: string;
    email: string;
    role: string;
  };
  playlistItems: Array<{
    id: string;
    track: {
      id: string;
      title: string;
      artist: {
        id: string;
        name: string;
      };
    };
    position: number;
  }>;
  _count: {
    playlistItems: number;
  };
}

export default function AdminPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'playlists' | 'flags'>('dashboard');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard?timeWindow=60');
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchPlaylists = async (query: string = '') => {
    try {
      const response = await fetch(`/api/admin/playlists?search=${encodeURIComponent(query)}&limit=20`);
      if (response.ok) {
        const data = await response.json();
        setPlaylists(data.playlists);
      }
    } catch (error) {
      console.error('Failed to search playlists:', error);
    }
  };

  const performAction = async (action: string, playlistId: string, data?: any) => {
    try {
      const response = await fetch('/api/admin/playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, playlistId, data }),
      });

      if (response.ok) {
        // Refresh the playlist list
        searchPlaylists(searchQuery);
      } else {
        alert('Failed to perform action');
      }
    } catch (error) {
      console.error('Error performing action:', error);
      alert('Failed to perform action');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground mt-2">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Monitor system health and moderate content</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        <Button
          variant={activeTab === 'dashboard' ? 'default' : 'outline'}
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          Dashboard
        </Button>
        <Button
          variant={activeTab === 'playlists' ? 'default' : 'outline'}
          onClick={() => {
            setActiveTab('playlists');
            searchPlaylists();
          }}
          className="flex items-center gap-2"
        >
          <Music className="h-4 w-4" />
          Playlists
        </Button>
        <Button
          variant={activeTab === 'flags' ? 'default' : 'outline'}
          onClick={() => setActiveTab('flags')}
          className="flex items-center gap-2"
        >
          <AlertTriangle className="h-4 w-4" />
          Flags
        </Button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && dashboardData && (
        <div className="space-y-6">
          {/* Alerts */}
          {dashboardData.alerts.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="h-5 w-5" />
                  Active Alerts ({dashboardData.alerts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dashboardData.alerts.map((alert, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                      <div>
                        <div className="font-medium text-foreground">{alert.type}</div>
                        <div className="text-sm text-muted-foreground">{alert.message}</div>
                      </div>
                      <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                        {alert.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {(dashboardData.metrics.successRate * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all platforms
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Parse Failure Rate</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {(dashboardData.metrics.parseFailureRate * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Threshold: {(dashboardData.thresholds.parseFailureRate * 100).toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">P95 Latency</CardTitle>
                <RefreshCw className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {dashboardData.metrics.p95Latency}ms
                </div>
                <p className="text-xs text-muted-foreground">
                  Threshold: {dashboardData.thresholds.p95Latency}ms
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <Users className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {dashboardData.metrics.totalRequests.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Last {dashboardData.timeWindow} minutes
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Platform Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Object.entries(dashboardData.metrics.platformBreakdown).map(([platform, metrics]: [string, any]) => (
                  <div key={platform} className="text-center p-4 border rounded-lg">
                    <div className="text-lg font-semibold capitalize">{platform}</div>
                    <div className="text-2xl font-bold text-green-600 mt-2">
                      {(metrics.successRate * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {metrics.totalRequests} requests
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {metrics.averageLatency}ms avg
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Playlists Tab */}
      {activeTab === 'playlists' && (
        <div className="space-y-6">
          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle>Search Playlists</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title, user name, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button onClick={() => searchPlaylists(searchQuery)}>
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Playlist Results */}
          <Card>
            <CardHeader>
              <CardTitle>Playlists ({playlists.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {playlists.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No playlists found. Try searching for playlists.
                </div>
              ) : (
                <div className="space-y-4">
                  {playlists.map((playlist) => (
                    <div key={playlist.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-semibold text-foreground">
                            {playlist.title || 'Untitled Playlist'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            By {playlist.user.name || playlist.user.email} • {playlist._count.playlistItems} tracks
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Week of {new Date(playlist.weekStartDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => performAction('re-parse', playlist.id)}
                          >
                            Re-parse
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => performAction('soft-delete', playlist.id, { reason: 'Manual deletion' })}
                          >
                            Soft Delete
                          </Button>
                        </div>
                      </div>
                      
                      {/* Track list */}
                      <div className="space-y-1">
                        {playlist.playlistItems.map((item) => (
                          <div key={item.id} className="flex items-center gap-2 text-sm">
                            <span className="w-6 text-center text-muted-foreground">{item.position}</span>
                            <span className="font-medium">{item.track.title}</span>
                            <span className="text-muted-foreground">by {item.track.artist.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Flags Tab */}
      {activeTab === 'flags' && (
        <Card>
          <CardHeader>
            <CardTitle>Flagged Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Flag management interface coming soon</p>
              <p className="text-sm mt-1">This will show user-reported content that needs moderation</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
