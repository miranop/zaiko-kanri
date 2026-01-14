package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"zaiko/internal/models"
	"zaiko/internal/repository"
)

type WarehouseHandler struct {
	warehouseRepo *repository.WarehouseRepository
}

func NewWarehouseHandler() *WarehouseHandler {
	return &WarehouseHandler{
		warehouseRepo: repository.NewWarehouseRepository(),
	}
}

func (h *WarehouseHandler) GetAll(c *gin.Context) {
	warehouses, err := h.warehouseRepo.FindAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if warehouses == nil {
		warehouses = []models.Warehouse{}
	}

	c.JSON(http.StatusOK, warehouses)
}

func (h *WarehouseHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	warehouse, err := h.warehouseRepo.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Warehouse not found"})
		return
	}

	c.JSON(http.StatusOK, warehouse)
}

func (h *WarehouseHandler) Create(c *gin.Context) {
	var req models.CreateWarehouseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	warehouse, err := h.warehouseRepo.Create(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, warehouse)
}

func (h *WarehouseHandler) Update(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var req models.UpdateWarehouseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	warehouse, err := h.warehouseRepo.Update(id, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, warehouse)
}

func (h *WarehouseHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	if err := h.warehouseRepo.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Warehouse deleted"})
}
