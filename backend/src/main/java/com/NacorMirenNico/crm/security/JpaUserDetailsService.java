package com.NacorMirenNico.crm.security;

import java.util.stream.Collectors;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.NacorMirenNico.crm.user.UserEntity;
import com.NacorMirenNico.crm.user.UserRepository;

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
                .map(r -> new SimpleGrantedAuthority(r.getName())) 
                .collect(Collectors.toSet())
        );
    }
}
