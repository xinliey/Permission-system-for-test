using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using System;
using SystemPermission;

[ApiController]
[Route("api/projects")]
public class ProjectsController : ControllerBase
{
    [HttpGet]

    public IActionResult GetProjects() //get data from db, pass it to UI
    {
        var list = new List<object>();

        string connString =
               "Server=localhost;" +
               "Database=latexapp;" +
               "User ID=root;" +
               "Password=******;";
        string sql = "SELECT * " +
            " FROM permission_system.permissionlist;";

        using (var conn = new MySqlConnection(connString))
        using (var cmd = new MySqlCommand(sql, conn))
        {

            conn.Open();

            using (var reader = cmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    string ProjectName = reader["projectName"].ToString();
                    string project_status = StatusDisplay(reader["status"].ToString());

                    bool selectable;
                    string approvedremark;

                    if (project_status != "รออนุมัติ")
                    {
                        approvedremark = reader["remark"].ToString();
                        selectable = true;
                    }
                    else
                    {
                        approvedremark = "";
                        selectable = false;
                    }

                    list.Add(new
                    {
                        selectable,
                        ProjectName,
                        approvedremark,
                        project_status
                        
                    });

                }
            }
            return Ok(list);
        }
    }
    private string StatusDisplay(string n)
    {
        switch (n)
        {
            case "0":
                return "รออนุมัติ";
            case "1":
                return "อนุมัติ";
            case "2":
                return "ไม่อนุมัติ";
            default:
                return "unknown";
        }
    }

    [HttpPost("approve")]
    public IActionResult ConfirmProjects([FromBody] List<Request_model> projects)
    {
        string connString =
       "Server=localhost;" +
       "Database=latexapp;" +
       "User ID=root;" +
       "Password=******;";

        string sql = @"
        UPDATE permission_system.permissionlist
        SET 
            status = '1',
            remark = @remark
        WHERE projectName = @projectName;
    ";
        using (var conn = new MySqlConnection(connString))
        {
            conn.Open();

            foreach (var dto in projects)
            {
                using (var cmd = new MySqlCommand(sql, conn))
                {
                    cmd.Parameters.AddWithValue("@projectName", dto.ProjectName);
                    cmd.Parameters.AddWithValue("@remark", dto.Remark ?? "");

                    cmd.ExecuteNonQuery();
                }
            }
        }

        return Ok();
    }
}
