import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Eye, QrCode, Edit } from "lucide-react";

export type PetOwner = { name?: string; email?: string };
export type PetRow = {
  id: number;
  name: string;
  username: string;
  type: string;
  is_active: boolean;
  created_at: string;
  photo_url?: string | null;
  users?: PetOwner;
};

export type PetsPanelProps = {
  pets: PetRow[];
  totalCount?: number; // optional to show total
  search: string;
  onSearchChange: (v: string) => void;
  onViewProfile: (username: string) => void;
  onDownloadQr: (pet: PetRow) => void;
  onToggleStatus: (petId: number, currentStatus: boolean) => void;
  onEditPet: (pet: PetRow) => void;
};

// Locale helpers
const formatDate = (iso: string) => new Date(iso).toLocaleDateString();
const formatNumber = (n: number) => new Intl.NumberFormat("en-IN").format(n);

const PetsPanel: React.FC<PetsPanelProps> = ({
  pets,
  totalCount,
  search,
  onSearchChange,
  onViewProfile,
  onDownloadQr,
  onToggleStatus,
  onEditPet,
}) => {
  const filtered = React.useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return pets;
    return pets.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      (p.username || "").toLowerCase().includes(q) ||
      (p.users?.name || "").toLowerCase().includes(q)
    );
  }, [pets, search]);

  const TableShell: React.FC<{ children: React.ReactNode; minWidth?: number }> = ({ children, minWidth = 900 }) => (
    <div className="bg-background overflow-hidden rounded-md border">
      <Table className={`min-w-[${minWidth}px] [&_th]:h-9 [&_th]:py-2 [&_td]:py-2` as any}>{children}</Table>
    </div>
  );

  const Header = (
    <TableHeader>
      <TableRow className="bg-muted/50">
        <TableHead>Pet</TableHead>
        <TableHead>Owner</TableHead>
        <TableHead>Type</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="">Created</TableHead>
        <TableHead className="w-[320px] text-center">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );

  return (
    <Card className="bg-card ring-1 ring-border rounded-xl">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="text-[15px] font-semibold">Pet Management</span>
          <Badge variant="secondary">
            {typeof totalCount === "number" ? formatNumber(totalCount) : formatNumber(pets.length)}
          </Badge>
        </CardTitle>
        <CardDescription className="text-muted-foreground">Manage all pet profiles and QR codes</CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search pets by name, owner, or username…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
            aria-label="Search pets"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-2.5 h-5 w-5 rounded-full text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
              title="Clear"
            >
              ×
            </button>
          )}
        </div>

        {/* Table / Empty */}
        {filtered.length === 0 ? (
          <div className="text-sm text-muted-foreground p-6 text-center">No pets match your search.</div>
        ) : (
          <TableShell>
            {Header}
            <TableBody>
              {filtered.map((pet) => (
                <TableRow key={pet.id}>
                  <TableCell>
                    <div className="flex items-center gap-3 min-w-0">
                      {pet.photo_url && (
                        <img
                          src={pet.photo_url}
                          alt={`${pet.name} photo`}
                          className="w-10 h-10 rounded-full object-cover ring-1 ring-border"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium truncate max-w-[220px]">{pet.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[220px]">@{pet.username}</p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="min-w-0">
                      <p className="font-medium truncate max-w-[220px]">{pet.users?.name || "—"}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[240px]">{pet.users?.email || "—"}</p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className="capitalize">{pet.type}</Badge>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={pet.is_active ? "default" : "destructive"}
                      className={pet.is_active ? "bg-green-600 text-white" : ""}
                    >
                      {pet.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>

                  <TableCell >{formatDate(pet.created_at)}</TableCell>

                  <TableCell>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewProfile(pet.username)}
                        title="View Pet Profile"
                        aria-label={`View profile of ${pet.name}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDownloadQr(pet)}
                        title="Download HD QR Code"
                        aria-label={`Download QR for ${pet.name}`}
                        className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                      >
                        <QrCode className="w-4 h-4" />
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => onToggleStatus(pet.id, pet.is_active)}
                        className={pet.is_active ? "bg-orange-600 hover:bg-orange-700" : "bg-green-600 hover:bg-green-700"}
                        title={pet.is_active ? "Deactivate Pet" : "Activate Pet"}
                        aria-label={`${pet.is_active ? "Deactivate" : "Activate"} ${pet.name}`}
                      >
                        {pet.is_active ? "Deactivate" : "Activate"}
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => onEditPet(pet)}
                        className="bg-blue-600 hover:bg-blue-700"
                        title="Edit Pet Details"
                        aria-label={`Edit ${pet.name}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </TableShell>
        )}
      </CardContent>
    </Card>
  );
};

export default PetsPanel;
