package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"zaiko/internal/models"
	"zaiko/internal/repository"
)

type CategoryHandler struct {
	categoryRepo *repository.CategoryRepository
}

func NewCategoryHandler() *CategoryHandler {
	return &CategoryHandler{
		categoryRepo: repository.NewCategoryRepository(),
	}
}

func (h *CategoryHandler) GetAll(c *gin.Context) {
	categories, err := h.categoryRepo.FindAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if categories == nil {
		categories = []models.Category{}
	}

	c.JSON(http.StatusOK, categories)
}

func (h *CategoryHandler) Create(c *gin.Context) {
	var req models.CreateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	category, err := h.categoryRepo.Create(req.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, category)
}

func (h *CategoryHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	if err := h.categoryRepo.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Category deleted"})
}
