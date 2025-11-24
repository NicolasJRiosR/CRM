package com.NacorMirenNico.crm.repo;

import com.NacorMirenNico.crm.domain.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClienteRepository extends JpaRepository<Cliente, Integer> {}
