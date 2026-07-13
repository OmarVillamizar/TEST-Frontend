import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../models/user';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-users',
  imports: [FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users {
  private readonly userService = inject(UserService);

  // --- Table state ---
  readonly users = signal<User[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);

  // --- Search by id ---
  readonly searchId = signal('');
  readonly filteredUsers = computed(() => {
    const term = this.searchId().trim();
    if (!term) return this.users();
    const id = Number(term);
    if (Number.isNaN(id)) return [];
    return this.users().filter((u) => u.id === id);
  });
  readonly searchMiss = computed(() => this.searchId().trim().length > 0 && this.filteredUsers().length === 0);

  // --- Create / edit modal ---
  readonly modalOpen = signal(false);
  readonly editingUser = signal<User | null>(null);
  readonly formNombre = signal('');
  readonly formActivo = signal(true);
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);

  // --- Delete confirmation ---
  readonly pendingDelete = signal<User | null>(null);
  readonly deleting = signal(false);

  constructor() {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.loadError.set(err.message ?? 'No se pudieron cargar los usuarios');
        this.loading.set(false);
      },
    });
  }

  clearSearch(): void {
    this.searchId.set('');
  }

  // --- Modal handling ---
  openCreate(): void {
    this.editingUser.set(null);
    this.formNombre.set('');
    this.formActivo.set(true);
    this.formError.set(null);
    this.modalOpen.set(true);
  }

  openEdit(user: User): void {
    this.editingUser.set(user);
    this.formNombre.set(user.nombre);
    this.formActivo.set(user.activo);
    this.formError.set(null);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    if (this.saving()) return;
    this.modalOpen.set(false);
  }

  saveUser(): void {
    const nombre = this.formNombre().trim();
    if (!nombre) {
      this.formError.set('El nombre es obligatorio');
      return;
    }

    this.saving.set(true);
    this.formError.set(null);
    const payload = { nombre, activo: this.formActivo() };
    const editing = this.editingUser();

    const request$ = editing
      ? this.userService.updateUser(editing.id, payload)
      : this.userService.createUser(payload);

    request$.subscribe({
      next: (saved) => {
        this.users.update((list) =>
          editing ? list.map((u) => (u.id === saved.id ? saved : u)) : [...list, saved],
        );
        this.saving.set(false);
        this.modalOpen.set(false);
      },
      error: (err: Error) => {
        this.formError.set(err.message ?? 'No se pudo guardar el usuario');
        this.saving.set(false);
      },
    });
  }

  // --- Delete handling ---
  askDelete(user: User): void {
    this.pendingDelete.set(user);
  }

  cancelDelete(): void {
    if (this.deleting()) return;
    this.pendingDelete.set(null);
  }

  confirmDelete(): void {
    const target = this.pendingDelete();
    if (!target) return;

    this.deleting.set(true);
    this.userService.deleteUser(target.id).subscribe({
      next: () => {
        this.users.update((list) => list.filter((u) => u.id !== target.id));
        this.deleting.set(false);
        this.pendingDelete.set(null);
      },
      error: () => {
        this.deleting.set(false);
        this.pendingDelete.set(null);
      },
    });
  }

  // --- Formatting ---
  formatDate(timestamp: string): string {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }
}
