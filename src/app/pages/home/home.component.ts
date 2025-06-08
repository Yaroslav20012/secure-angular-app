import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  constructor(private authService: AuthService){}
  sqlExample = "'; DROP TABLE users;--"; // Пример SQLi атаки
  xssExample = "<script>alert('XSS')</script>"
  csrfExample = `<form action="https://example.com/change-email" method="POST" style="display:none;" id="csrfForm">
  <input type="hidden" name="email" value="attacker@example.com">
</form>

<script>
  document.getElementById('csrfForm').submit();
</script> `

  isAuthenticated(): boolean {
    return !this.authService.isAuthenticated();
  }
}

