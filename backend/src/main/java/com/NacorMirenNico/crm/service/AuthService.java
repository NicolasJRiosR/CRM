package com.NacorMirenNico.crm.service;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserDetailsService userDetailsService, 
                      PasswordEncoder passwordEncoder,
                      JwtService jwtService) {
        this.userDetailsService = userDetailsService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public String authenticate(String username, String password) {
        try {
            System.out.println("=== INICIANDO AUTENTICACIÓN ===");
            System.out.println("Usuario: " + username);
            System.out.println("Password recibida: " + password);
            
            // Carga el usuario desde la base de datos
            UserDetails user = userDetailsService.loadUserByUsername(username);
            
            System.out.println("Usuario encontrado: " + user.getUsername());
            System.out.println("Password en BD: " + user.getPassword());
            System.out.println("Enabled: " + user.isEnabled());
            System.out.println("Authorities: " + user.getAuthorities());
            
            // Verifica la contraseña manualmente
            boolean matches = passwordEncoder.matches(password, user.getPassword());
            System.out.println("Password matches: " + matches);
            
            if (!matches) {
                System.out.println("❌ Contraseña incorrecta");
                throw new BadCredentialsException("Contraseña incorrecta");
            }
            
            System.out.println("✅ Autenticación exitosa");
            
            // Genera el token JWT
            return jwtService.generateToken(user);
            
        } catch (UsernameNotFoundException e) {
            System.out.println("❌ Usuario no encontrado: " + username);
            throw new BadCredentialsException("Usuario no encontrado");
        } catch (BadCredentialsException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("❌ Error en autenticación: " + e.getMessage());
            e.printStackTrace();
            throw new BadCredentialsException("Error de autenticación");
        }
    }
}