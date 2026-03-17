import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllUsers, updateUserRole } from "@/store/admin/user-slice";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const dispatch = useDispatch();
  const { userList, isLoading } = useSelector((state) => state.adminUser);
  const { toast } = useToast();

  const filteredUserList =
    userList && userList.length > 0
      ? userList.filter((userItem) => {
          const matchesSearch =
            userItem.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            userItem.email.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesRole =
            roleFilter === "all" || userItem.role === roleFilter;

          return matchesSearch && matchesRole;
        })
      : [];

  function handleUpdateRole(userId, currentRole) {
    const newRole = currentRole === "admin" ? "user" : "admin";
    dispatch(updateUserRole({ userId, role: newRole })).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllUsers());
        toast({
          title: "Success",
          description: data?.payload?.message,
        });
      }
    });
  }

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <CardTitle className="text-xl font-bold">User Management</CardTitle>
        <div className="flex items-center gap-4">
          <div className="relative w-[250px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name or email..."
              className="pl-8 bg-background"
            />
          </div>
          <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>User Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUserList && filteredUserList.length > 0
              ? filteredUserList.map((userItem) => (
                  <TableRow key={userItem._id}>
                    <TableCell className="font-medium">{userItem._id}</TableCell>
                    <TableCell>{userItem.userName}</TableCell>
                    <TableCell>{userItem.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          userItem.role === "admin" ? "default" : "secondary"
                        }
                      >
                        {userItem.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() =>
                          handleUpdateRole(userItem._id, userItem.role)
                        }
                      >
                        Change Role
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default AdminUsers;
