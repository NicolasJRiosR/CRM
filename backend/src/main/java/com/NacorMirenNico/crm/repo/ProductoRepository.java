package com.NacorMirenNico.crm.repo;

import com.NacorMirenNico.crm.domain.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoRepository extends JpaRepository<Producto, Integer> {}
