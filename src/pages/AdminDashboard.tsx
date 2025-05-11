
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NavBar } from "@/components/NavBar";
import { useNavigate } from "react-router-dom";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar 
        userType="admin" 
        userName="Admin"
      />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Manage teachers and students</p>
              <Button 
                className="w-full mb-2"
                onClick={() => navigate("/admin-dashboard/teachers")}
              >
                Manage Teachers
              </Button>
              <Button 
                className="w-full"
                onClick={() => navigate("/admin-dashboard/students")}
              >
                Manage Students
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>School Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Manage schools and classes</p>
              <Button 
                className="w-full mb-2"
                onClick={() => navigate("/admin-dashboard/schools")}
              >
                Manage Schools
              </Button>
              <Button 
                className="w-full"
                onClick={() => navigate("/admin-dashboard/classes")}
              >
                Manage Classes
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Configure system settings</p>
              <Button 
                className="w-full"
                onClick={() => navigate("/admin-dashboard/settings")}
              >
                System Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
