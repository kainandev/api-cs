using Microsoft.AspNetCore.Mvc;
using Api.Models;
using Api.Repositories;

namespace Api.Controllers {
    [ApiController]
    [Route("api/users")]
    public class UsersController : ControllerBase {
        private readonly IUserRepository _repository;

        public UsersController(IUserRepository repository) {
            _repository = repository;
        }

        // GET /api/users
        [HttpGet]
        public async Task<IActionResult> GetAll() {
            var users = await _repository.GetAll();
            return Ok(users);
        }

        // GET /api/users/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id) {
            var user = await _repository.GetById(id);

            if (user == null) {
                return NotFound("Usuário não encontrado.");
            }

            return Ok(user);
        }

        // POST /api/users
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] User user) {
            if (string.IsNullOrWhiteSpace(user.CPF)) {
                return BadRequest("O CPF é obrigatório.");
            }

            if (string.IsNullOrWhiteSpace(user.Email)) {
                return BadRequest("O e-mail é obrigatório.");
            }

            var created = await _repository.Create(user);

            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        // PUT /api/users/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] User updatedData) {
            var updated = await _repository.Update(id, updatedData);

            if (updated == null) {
                return NotFound("Usuário não encontrado.");
            }

            return Ok(updated);
        }

        // DELETE /api/users/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id) {
            var deleted = await _repository.Delete(id);

            if (!deleted) {
                return NotFound("Usuário não encontrado.");
            }

            return NoContent();
        }
    }
}