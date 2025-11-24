package com.NacorMirenNico.crm.security;

import com.NacorMirenNico.crm.user.UserEntity;
import com.NacorMirenNico.crm.user.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
public class JpaUserDetailsService implements UserDetailsService {

    private final UserRepository repo;

    public JpaUserDetailsService(UserRepository repo) {
        this.repo = repo;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserEntity u = repo.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));

        return new User(
            u.getUsername(),
            u.getPassword(),
            u.isEnabled(),
            true, true, true,
            u.getRoles().stream()
                .map(r -> new SimpleGrantedAuthority(r.getName())) // "ROLE_ADMIN", "ROLE_USER"
                .collect(Collectors.toSet())
        );
    }
}
